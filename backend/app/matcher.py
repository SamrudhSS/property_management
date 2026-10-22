import re
from typing import List, Tuple
from urllib.parse import quote
from app.models import Property, Lead, MatchItem

def calculate_match(lead: Lead, prop: Property) -> Tuple[int, List[str]]:
    """
    Computes a 0-100 compatibility score between a prospective client (Lead)
    and an available Property listing.
    """
    # Only match active properties
    if prop.status.lower() not in ["available", "ready", "open"]:
        return 0, ["Property is not currently available"]

    score = 0
    reasons = []

    # 1. Transaction Type Match (Mandatory filter)
    lead_type = lead.client_type.lower()
    prop_type = prop.listing_type.lower()
    
    if "tenant" in lead_type and "rent" not in prop_type:
        return 0, ["Type mismatch: Client wants Rent, Property is for Sale"]
    if "buyer" in lead_type and "sale" not in prop_type:
        return 0, ["Type mismatch: Client wants to Buy, Property is for Rent"]

    reasons.append(f"Transaction match: {lead.client_type} looking for {prop.listing_type}")

    # 2. BHK Compatibility (up to 35 points)
    lead_bhks = [b.strip().lower() for b in lead.preferred_bhk.replace("/", ",").split(",") if b.strip()]
    prop_bhk = prop.bhk.lower().strip()

    exact_bhk = any(b in prop_bhk or prop_bhk in b for b in lead_bhks)
    if exact_bhk:
        score += 35
        reasons.append(f"Exact BHK match: {prop.bhk}")
    else:
        # Check adjacent BHK (e.g. looking for 2 BHK, property is 3 BHK or 1.5 BHK)
        lead_nums = re.findall(r"\d+", " ".join(lead_bhks))
        prop_nums = re.findall(r"\d+", prop_bhk)
        if lead_nums and prop_nums:
            diff = abs(int(lead_nums[0]) - int(prop_nums[0]))
            if diff == 1:
                score += 15
                reasons.append(f"Close BHK option: {prop.bhk} (Client preferred {lead.preferred_bhk})")

    # 3. Location Compatibility (up to 35 points)
    lead_locs = [l.strip().lower() for l in lead.preferred_locations.split(",") if l.strip()]
    prop_location = f"{prop.building_name} {prop.location_area}".lower()

    location_matched = False
    for loc in lead_locs:
        if loc in prop_location or any(token in prop_location for token in loc.split() if len(token) > 3):
            location_matched = True
            break

    if location_matched:
        score += 35
        reasons.append(f"Location match: {prop.location_area or prop.building_name}")
    elif not lead_locs or not prop_location.strip():
        # Open location preference
        score += 20
        reasons.append("Open / unspecified location preference")
    else:
        # Check city level (e.g. Thane, Mumbai)
        for city in ["thane", "mumbai", "navi mumbai", "pune", "mulund"]:
            if city in " ".join(lead_locs) and city in prop_location:
                score += 15
                reasons.append(f"General area match ({city.title()})")
                break

    # 4. Budget Compatibility (up to 20 points)
    price = prop.rent_price
    min_b = lead.min_budget
    max_b = lead.max_budget

    if min_b > 0 or max_b > 0:
        if max_b > 0 and price <= max_b:
            if min_b == 0 or price >= min_b:
                score += 20
                reasons.append(f"Budget fit: Rs.{price:,.0f} is within Rs.{min_b:,.0f} - Rs.{max_b:,.0f}")
            else:
                score += 15
                reasons.append(f"Under budget: Rs.{price:,.0f} (Client max: Rs.{max_b:,.0f})")
        elif max_b > 0 and price <= max_b * 1.10:
            score += 10
            reasons.append(f"Slightly above max budget (within 10% for negotiation): Rs.{price:,.0f}")
        else:
            reasons.append(f"Exceeds max budget: Rs.{price:,.0f} > Rs.{max_b:,.0f}")
    else:
        score += 15
        reasons.append("Flexible budget")

    # 5. Furnishing Compatibility (up to 10 points)
    lead_furn = lead.furnishing.lower()
    prop_furn = prop.furnishing.lower()
    if lead_furn in ["any", ""] or lead_furn == prop_furn:
        score += 10
        if lead_furn == prop_furn:
            reasons.append(f"Desired furnishing: {prop.furnishing}")
    else:
        reasons.append(f"Furnishing variance: {prop.furnishing} (Client preferred {lead.furnishing})")

    return min(100, score), reasons

def generate_pitch(lead: Lead, prop: Property) -> str:
    """Generates an engaging, professional WhatsApp pitch message ready for the broker to send."""
    salutation = f"Hello {lead.name}," if lead.name else "Hello,"
    location_str = f"{prop.building_name}, {prop.location_area}".strip(", ")
    
    msg_lines = [
        f"{salutation}",
        f"We found a matching property that fits your requirement!",
        "",
        f"🏠 *{prop.bhk} Available for {prop.listing_type}*",
        f"📍 Location: {location_str}" if location_str else "",
        f"💰 {prop.listing_type}: ₹{prop.rent_price:,.0f}/month" if prop.listing_type == "Rent" else f"💰 Price: ₹{prop.rent_price:,.0f}",
        f"💵 Deposit: {prop.deposit}" if prop.deposit else "",
        f"🛋️ Furnishing: {prop.furnishing}",
        f"✨ Features: {prop.features}" if prop.features else "",
        "",
        "Please let us know if you'd like to schedule a site visit!",
        f"*{prop.agency or 'IRA PROPERTY'}*"
    ]
    return "\n".join([line for line in msg_lines if line != ""])

def match_properties_for_lead(lead: Lead, all_properties: List[Property], min_score: int = 50) -> List[MatchItem]:
    """Finds all matching properties for a given lead, sorted by highest compatibility score."""
    results = []
    for prop in all_properties:
        score, reasons = calculate_match(lead, prop)
        if score >= min_score:
            results.append(
                MatchItem(
                    property=prop,
                    lead=lead,
                    score=score,
                    match_reasons=reasons,
                    whatsapp_pitch=generate_pitch(lead, prop)
                )
            )
    results.sort(key=lambda x: x.score, reverse=True)
    return results

def match_leads_for_property(prop: Property, all_leads: List[Lead], min_score: int = 50) -> List[MatchItem]:
    """Finds all prospective leads interested in a newly available property."""
    results = []
    for lead in all_leads:
        score, reasons = calculate_match(lead, prop)
        if score >= min_score:
            results.append(
                MatchItem(
                    property=prop,
                    lead=lead,
                    score=score,
                    match_reasons=reasons,
                    whatsapp_pitch=generate_pitch(lead, prop)
                )
            )
    results.sort(key=lambda x: x.score, reverse=True)
    return results
