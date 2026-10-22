import sys
from pathlib import Path
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.parser import parse_whatsapp_text, is_property_listing, parse_zip_archive
from app.excel_db import ExcelDatabase
from app.models import PropertyCreate

SAMPLE_CLIENT_MSG = """🟩 AVAILABLE 2 BHK FLAT FOR RENT 

📍 Location: Hill Crest, Thane West

✅ Semi-Furnished Flat
   - Modular Kitchen
   - Sofa Bed Available
   - Ready to Move

💰 Rent: 30,000/- per month  
💵 Deposit: 6 Months Rent

 Call for Visit: 
📞 9167464416  
📞 9324375688

 *IRA PROPERTY
"""

CHAT_WITH_NOISE = """Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[6/9/26, 11:07:51 AM] Aadarsh Jgi: <image omitted>
[8/12/26, 8:17:13 AM] Aadarsh Jgi: [Forwarded] https://www.linkedin.com/in/adarsh-madali-b02388384
[8/27/26, 12:57:35 PM] You: https://skills.yourlearning.ibm.com/activity/PLAN-7913EE1DB030
[9/29/26, 11:39:12 AM] Ishwar Kaka: 🟩 AVAILABLE 2 BHK FLAT FOR RENT 

📍 Location: Hill Crest, Thane West

✅ Semi-Furnished Flat
   - Modular Kitchen
   - Sofa Bed Available
   - Ready to Move

💰 Rent: 30,000/- per month  
💵 Deposit: 6 Months Rent

 Call for Visit: 
📞 9167464416  
📞 9324375688

 *IRA PROPERTY
[9/29/26, 1:31:00 PM] Ishwar Kaka: understood?
[9/29/26, 1:32:00 PM] Ishwar Kaka: We can have video call in evening.
"""

def test_client_sample_message():
    assert is_property_listing(SAMPLE_CLIENT_MSG) == True, "Failed to classify client sample as listing"
    
    parsed = parse_whatsapp_text(SAMPLE_CLIENT_MSG)
    assert len(parsed) == 1, f"Expected 1 parsed listing, got {len(parsed)}"
    p = parsed[0]
    
    print("\n--- Parsed Client Sample ---")
    print(f"Listing Type : {p.listing_type}")
    print(f"BHK          : {p.bhk}")
    print(f"Building     : {p.building_name}")
    print(f"Location     : {p.location_area}")
    print(f"Furnishing   : {p.furnishing}")
    print(f"Rent Price   : Rs.{p.rent_price:,.0f}")
    print(f"Deposit      : {p.deposit}")
    print(f"Features     : {p.features}")
    print(f"Contacts     : {p.contact_numbers}")
    print(f"Agency       : {p.agency}")
    print(f"Status       : {p.status}")

    assert p.listing_type == "Rent"
    assert p.bhk == "2 BHK"
    assert p.building_name == "Hill Crest"
    assert "Thane West" in p.location_area
    assert p.furnishing == "Semi-Furnished"
    assert p.rent_price == 30000.0
    assert "180,000" in p.deposit or "6 Months" in p.deposit
    assert "9167464416" in p.contact_numbers
    assert "9324375688" in p.contact_numbers
    assert "IRA PROPERTY" in p.agency

def test_stream_with_noise():
    parsed = parse_whatsapp_text(CHAT_WITH_NOISE)
    assert len(parsed) == 1, f"Expected exactly 1 listing isolated from chat noise, got {len(parsed)}"
    p = parsed[0]
    assert p.bhk == "2 BHK"
    assert p.building_name == "Hill Crest"
    print("✓ Successfully filtered out casual chat and links, extracted only real estate listing!")

def test_excel_db_roundtrip(tmp_path):
    test_db_path = tmp_path / "test_real_estate.xlsx"
    db = ExcelDatabase(test_db_path)
    
    parsed = parse_whatsapp_text(SAMPLE_CLIENT_MSG)[0]
    saved_prop = db.add_property(parsed)
    
    assert saved_prop.id == "PROP-0001"
    assert saved_prop.rent_price == 30000.0
    
    all_props = db.get_all_properties()
    assert len(all_props) == 1
    assert all_props[0].id == "PROP-0001"
    assert all_props[0].building_name == "Hill Crest"
    print("✓ Successfully wrote and read back from Excel database (.xlsx)!")

if __name__ == "__main__":
    from pathlib import Path
    import tempfile
    
    test_client_sample_message()
    test_stream_with_noise()
    with tempfile.TemporaryDirectory() as td:
        test_excel_db_roundtrip(Path(td))
    print("\nALL PARSER AND EXCEL TESTS PASSED SUCCESSFULLY!")
