import re
import io
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from app.models import PropertyCreate

# Regex patterns for splitting WhatsApp multi-message chat transcripts
IOS_REGEX = re.compile(
    r"^\[(?P<date>\d{1,2}/\d{1,2}/\d{2,4}),\s*(?P<time>\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]\s*(?P<sender>[^:]+):\s*(?P<msg>.*)$"
)
ANDROID_REGEX = re.compile(
    r"^(?P<date>\d{1,2}/\d{1,2}/\d{2,4}),\s*(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(?P<sender>[^:]+):\s*(?P<msg>.*)$"
)
MARKDOWN_MSG_REGEX = re.compile(
    r"^\[(?P<time>\d{1,2}:\d{2}\s*(?:AM|PM)?)\]\s*\*\*(?P<sender>[^*]+):\*\*\s*(?P<msg>.*)$"
)

# Indian 10-digit mobile number pattern
PHONE_REGEX = re.compile(r"(?:(?:\+91|0)[\s\-]?)?([6-9]\d{4}[\s\-]?\d{5})\b")

# BHK pattern
BHK_REGEX = re.compile(r"(?i)\b(\d+)\s*(?:bhk|rk|bed(?:room)?s?)\b|\b(1rk|1bhk|2bhk|3bhk|4bhk|5bhk)\b")

# Price / Rent pattern
PRICE_PATTERN = re.compile(
    r"(?i)(?:rent|price|cost|💰|₹|rs\.?)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(cr|crore|lakhs?|lacs?|k|per\s*month|/[-–]?)?",
    re.IGNORECASE
)

# Deposit pattern
DEPOSIT_PATTERN = re.compile(
    r"(?i)(?:deposit|depo?|💵)\s*[:\-]?\s*([^\n\r]+)"
)

# Location pattern with strict word boundaries to avoid matching inside words like 'flat'
LOCATION_PATTERN = re.compile(
    r"(?i)(?:📍\s*(?:Location\s*[:\-]?)?|(?:\b(?:location|locality|project|society|complex)\b))\s*[:\-]?\s*([^\n\r]+)",
    re.IGNORECASE
)

# Agency / Broker pattern
AGENCY_PATTERN = re.compile(
    r"(?i)(?:\*|\b)([A-Z0-9\s&]{2,30}(?:PROPERTY|PROPERTIES|REALTORS?|REALTY|ESTATE|ASSOCIATES))\b\*?"
)

def clean_text(text: str) -> str:
    """Removes null bytes and cleans up carriage returns."""
    return text.replace("\r\n", "\n").replace("\r", "\n").strip()

def split_chat_messages(raw_text: str) -> List[Dict[str, str]]:
    """
    Splits an exported WhatsApp chat file or text stream into individual messages.
    Preserves sender, timestamp (if present), and full multiline body.
    """
    lines = clean_text(raw_text).split("\n")
    messages: List[Dict[str, str]] = []
    
    current_msg = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current_msg:
                current_msg["body"] += "\n"
            continue

        # Check iOS format: [6/9/26, 11:07:51 AM] Sender: Message
        match_ios = IOS_REGEX.match(stripped)
        match_android = ANDROID_REGEX.match(stripped)
        match_md = MARKDOWN_MSG_REGEX.match(stripped)

        matched = match_ios or match_android or match_md

        if matched:
            if current_msg and current_msg["body"].strip():
                messages.append(current_msg)
            
            sender = matched.group("sender").strip()
            date = matched.groupdict().get("date", "")
            time = matched.groupdict().get("time", "")
            first_line = matched.group("msg").strip()
            
            current_msg = {
                "sender": sender,
                "timestamp": f"{date} {time}".strip(),
                "body": first_line
            }
        else:
            if current_msg:
                current_msg["body"] += ("\n" + stripped)
            else:
                # Text that doesn't start with a header (e.g. directly pasted WhatsApp message)
                current_msg = {
                    "sender": "",
                    "timestamp": "",
                    "body": stripped
                }

    if current_msg and current_msg["body"].strip():
        messages.append(current_msg)

    return messages

def is_property_listing(text: str) -> bool:
    """
    Heuristic classifier to check if a message is a real estate listing
    rather than casual talk, links, or media placeholders.
    """
    cleaned = text.lower()
    
    # Ignore typical non-listing WhatsApp messages
    if "<image omitted>" in cleaned or "<document omitted>" in cleaned:
        return False
    if "messages and calls are end-to-end encrypted" in cleaned:
        return False
    if len(cleaned.strip()) < 15:
        return False

    has_bhk = bool(BHK_REGEX.search(cleaned)) or any(
        kw in cleaned for kw in ["commercial", "penthouse", "studio", "row house", "villa", "bungalow", "shop", "office"]
    )
    has_transaction = any(
        kw in cleaned for kw in [
            "rent", "lease", "sale", "sell", "outright", "deposit", "available", 
            "ready to move", "semi-furnished", "fully furnished", "unfurnished",
            "sqft", "sq ft", "carpet"
        ]
    )
    has_contact = bool(PHONE_REGEX.search(text))

    # Must have either (BHK + transaction/contact) or (rent/price + location/contact)
    if has_bhk and (has_transaction or has_contact):
        return True
    if ("rent" in cleaned or "sale" in cleaned) and ("location" in cleaned or "📍" in text) and has_contact:
        return True

    return False

def extract_numbers(text: str) -> List[str]:
    """Extracts unique 10-digit Indian mobile numbers."""
    matches = PHONE_REGEX.findall(text)
    numbers = []
    for m in matches:
        clean_num = re.sub(r"[^\d]", "", m)
        if len(clean_num) == 10 and clean_num not in numbers:
            numbers.append(clean_num)
        elif len(clean_num) > 10 and clean_num[-10:] not in numbers:
            numbers.append(clean_num[-10:])
    return numbers

def extract_rent_price(text: str) -> Tuple[float, str]:
    """
    Extracts numerical rent or sale price in INR.
    Handles '30,000/-', '30k', '1.85 Cr', '75 Lacs'.
    """
    # First search for lines with Rent or Price or 💰
    for line in text.split("\n"):
        if any(k in line.lower() for k in ["rent", "price", "💰", "₹", "rs"]):
            match = PRICE_PATTERN.search(line)
            if match:
                raw_num = match.group(1).replace(",", "")
                unit = (match.group(2) or "").lower().strip()
                try:
                    val = float(raw_num)
                    if "cr" in unit:
                        val *= 10_000_000
                    elif "lac" in unit or "lakh" in unit:
                        val *= 100_000
                    elif "k" in unit:
                        val *= 1_000
                    return val, line.strip()
                except ValueError:
                    pass

    # Fallback to direct number with /-
    fallback = re.search(r"(\d{1,3}(?:,\d{2,3})+|\d{4,9})\s*/-", text)
    if fallback:
        val = float(fallback.group(1).replace(",", ""))
        return val, f"{val:,.0f}/-"

    return 0.0, ""

def extract_deposit(text: str, rent_amount: float = 0.0) -> str:
    """
    Extracts security deposit. If '6 Months Rent' and rent is given, calculates total INR.
    """
    match = DEPOSIT_PATTERN.search(text)
    if not match:
        return ""
    
    dep_str = match.group(1).strip()
    # Clean leading deposit labels, emojis or trailing markers
    dep_str = re.sub(r"(?i)^(?:deposit|depo?)\s*[:\-]?\s*", "", dep_str).strip()
    dep_str = re.sub(r"[💵💰\*\#]", "", dep_str).strip()

    # If format like "6 Months Rent"
    months_match = re.search(r"(\d+)\s*months?\s*(?:rent)?", dep_str, re.IGNORECASE)
    if months_match and rent_amount > 0:
        months = int(months_match.group(1))
        calculated = months * rent_amount
        return f"{dep_str} (₹{calculated:,.0f})"

    return dep_str

def extract_bhk(text: str) -> str:
    """Extracts standardized BHK string."""
    match = BHK_REGEX.search(text)
    if match:
        if match.group(1):
            return f"{match.group(1)} BHK"
        elif match.group(2):
            val = match.group(2).upper()
            if "BHK" in val:
                return f"{val[:-3]} BHK"
            elif "RK" in val:
                return f"{val[:-2]} RK"
            return val
    
    for term in ["Penthouse", "Studio", "Commercial", "Shop", "Office", "Villa", "Row House"]:
        if re.search(rf"\b{term}\b", text, re.IGNORECASE):
            return term

    return "2 BHK"  # default standard

def extract_furnishing(text: str) -> str:
    lower = text.lower()
    if "fully furnished" in lower or "full furnished" in lower:
        return "Fully Furnished"
    elif "semi-furnished" in lower or "semi furnished" in lower:
        return "Semi-Furnished"
    elif "unfurnished" in lower or "raw" in lower:
        return "Unfurnished"
    return "Semi-Furnished"

def extract_location(text: str) -> Tuple[str, str]:
    """
    Extracts building name and location area.
    Example: 'Hill Crest, Thane West' -> building: 'Hill Crest', area: 'Thane West'
    """
    building_name = ""
    location_area = ""

    match = LOCATION_PATTERN.search(text)
    if match:
        raw_loc = match.group(1).strip()
        # Clean up leading location labels, emojis, or markdown
        raw_loc = re.sub(r"(?i)^(?:location|locality|project)\s*[:\-]?\s*", "", raw_loc).strip()
        raw_loc = re.sub(r"[📍✅\*\#]", "", raw_loc).strip()
        parts = [p.strip() for p in raw_loc.split(",") if p.strip()]
        if len(parts) >= 2:
            building_name = parts[0]
            location_area = ", ".join(parts[1:])
        elif len(parts) == 1:
            location_area = parts[0]

    if not location_area:
        # Check for common localities
        known_areas = [
            "Thane West", "Thane East", "Majiwada", "Ghodbunder Road", "Hiranandani Estate",
            "Kolshet Road", "Naupada", "Vasant Vihar", "Wagle Estate", "Kasarvadavali",
            "Mulund West", "Mulund East", "Bhandup", "Kanjurmarg", "Powai", "Andheri West",
            "Andheri East", "Borivali West", "Kandivali", "Malad", "Goregaon", "Vashi",
            "Nerul", "Kharghar", "Panvel", "Airoli"
        ]
        for area in known_areas:
            if re.search(rf"\b{area}\b", text, re.IGNORECASE):
                location_area = area
                break

    return building_name, location_area

def extract_features(text: str) -> str:
    """Extracts amenities and special features list."""
    features = []
    lines = text.split("\n")
    for line in lines:
        cleaned_line = line.strip()
        if cleaned_line.startswith(("-", "•", "*", "✅", "✔")):
            feat = re.sub(r"^[\-•\*✅✔\s]+", "", cleaned_line).strip()
            # Ignore rent/deposit, contact, furnishing, or agency lines
            if not any(k in feat.lower() for k in ["rent", "deposit", "call", "location", "contact", "bhk", "furnished", "property", "realtor"]):
                if len(feat) > 2 and feat not in features:
                    features.append(feat)

    # Check for inline keywords
    keywords = [
        "Ready to Move", "Modular Kitchen", "Sofa Bed", "Balcony", "Car Parking",
        "Higher Floor", "Vastu Compliant", "Gated Society", "Gym", "Swimming Pool"
    ]
    for kw in keywords:
        if re.search(rf"\b{kw}\b", text, re.IGNORECASE) and kw not in features:
            features.append(kw)

    return ", ".join(features)

def extract_agency(text: str, sender: str = "") -> str:
    """Extracts brokerage or agency name."""
    match = AGENCY_PATTERN.search(text)
    if match:
        agency = match.group(1).strip()
        return agency.replace("*", "").strip()
    
    # Fallback to sender if sender looks like an agency
    if sender and any(k in sender.lower() for k in ["property", "properties", "realtor", "estate"]):
        return sender.strip()
    
    return ""

def parse_single_message_to_property(msg: Dict[str, str], source_label: str = "WhatsApp") -> PropertyCreate:
    """
    Parses an individual WhatsApp message into a structured PropertyCreate model.
    """
    body = msg.get("body", "")
    sender = msg.get("sender", "")

    # Listing type: Rent vs Sale
    listing_type = "Rent"
    lower_body = body.lower()
    if any(k in lower_body for k in ["for sale", "available for sale", "outright", "flat for sale", "resale"]):
        listing_type = "Sale"
    elif "rent" in lower_body or "for rent" in lower_body or "lease" in lower_body:
        listing_type = "Rent"

    bhk = extract_bhk(body)
    building_name, location_area = extract_location(body)
    furnishing = extract_furnishing(body)
    rent_price, _ = extract_rent_price(body)
    deposit = extract_deposit(body, rent_price)
    features = extract_features(body)
    contacts = extract_numbers(body)
    agency = extract_agency(body, sender)

    contact_str = ", ".join(contacts)

    return PropertyCreate(
        listing_type=listing_type,
        bhk=bhk,
        building_name=building_name,
        location_area=location_area,
        furnishing=furnishing,
        rent_price=rent_price,
        deposit=deposit,
        features=features,
        contact_numbers=contact_str,
        agency=agency,
        status="Available",
        raw_message=body,
        source=source_label
    )

def parse_whatsapp_text(raw_text: str, source_label: str = "WhatsApp Text") -> List[PropertyCreate]:
    """
    Splits multi-message text, filters property listings, and parses each into PropertyCreate.
    """
    messages = split_chat_messages(raw_text)
    listings = []

    for msg in messages:
        body = msg.get("body", "")
        if is_property_listing(body):
            prop = parse_single_message_to_property(msg, source_label=source_label)
            listings.append(prop)

    # If no listings were detected via message splitting (e.g., user pasted a single listing directly)
    if not listings and is_property_listing(raw_text):
        single_msg = {"sender": "", "timestamp": "", "body": raw_text}
        listings.append(parse_single_message_to_property(single_msg, source_label=source_label))

    return listings

def parse_zip_archive(zip_bytes: bytes, filename: str = "export.zip") -> Tuple[int, List[PropertyCreate]]:
    """
    Extracts text/markdown chat logs from a WhatsApp export .zip archive in memory,
    splits messages, and parses all property listings found.
    """
    all_listings: List[PropertyCreate] = []
    total_messages = 0

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for name in z.namelist():
            lower_name = name.lower()
            if lower_name.endswith(".txt") or lower_name.endswith(".md"):
                try:
                    content = z.read(name).decode("utf-8", errors="replace")
                    msgs = split_chat_messages(content)
                    total_messages += len(msgs)
                    for msg in msgs:
                        body = msg.get("body", "")
                        if is_property_listing(body):
                            all_listings.append(
                                parse_single_message_to_property(msg, source_label=f"Zip: {filename}/{name}")
                            )
                except Exception as e:
                    print(f"Error reading file {name} inside zip: {e}")

    return total_messages, all_listings
