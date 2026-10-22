import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.excel_db import excel_db
from app.models import PropertyCreate, LeadCreate

def seed():
    print("Seeding initial data into real_estate_database.xlsx ...")
    
    # 1. Properties
    p1 = PropertyCreate(
        listing_type="Rent",
        bhk="2 BHK",
        building_name="Hill Crest",
        location_area="Thane West",
        furnishing="Semi-Furnished",
        rent_price=30000.0,
        deposit="6 Months Rent (₹180,000)",
        features="Modular Kitchen, Sofa Bed Available, Ready to Move",
        contact_numbers="9167464416, 9324375688",
        agency="IRA PROPERTY",
        status="Available",
        source="WhatsApp Export (Ishwar Kaka Sample)",
        raw_message="🟩 AVAILABLE 2 BHK FLAT FOR RENT\n📍 Location: Hill Crest, Thane West\n✅ Semi-Furnished Flat\n- Modular Kitchen\n- Sofa Bed Available\n- Ready to Move\n💰 Rent: 30,000/- per month\n💵 Deposit: 6 Months Rent\nCall for Visit:\n📞 9167464416\n📞 9324375688\n*IRA PROPERTY"
    )
    p2 = PropertyCreate(
        listing_type="Rent",
        bhk="1 BHK",
        building_name="Hiranandani Estate",
        location_area="Ghodbunder Road, Thane West",
        furnishing="Fully Furnished",
        rent_price=24000.0,
        deposit="₹1,00,000",
        features="AC in Bedroom, Double Bed, Refrigerator, TV, Club House access",
        contact_numbers="9820112233",
        agency="IRA PROPERTY",
        status="Available",
        source="WhatsApp Ingestion",
        raw_message="Available 1 BHK fully furnished in Hiranandani Estate, Thane West. Rent 24k, dep 1 lac. Call 9820112233"
    )
    p3 = PropertyCreate(
        listing_type="Sale",
        bhk="3 BHK",
        building_name="Lodha Amara",
        location_area="Kolshet Road, Thane West",
        furnishing="Unfurnished",
        rent_price=17500000.0,
        deposit="N/A",
        features="3 Balconies, 2 Covered Parkings, Grand Clubhouse, Olympic Swimming Pool, Garden Facing",
        contact_numbers="9819001122",
        agency="IRA PROPERTY",
        status="Available",
        source="Direct Broker Entry",
        raw_message="3 BHK outright for sale in Lodha Amara Kolshet Thane West. 1.75 Cr negotiable. Call 9819001122"
    )

    excel_db.add_property(p1)
    excel_db.add_property(p2)
    excel_db.add_property(p3)

    # 2. Leads (CRM)
    l1 = LeadCreate(
        name="Rahul Sharma",
        phone="9876543210",
        client_type="Tenant",
        preferred_bhk="2 BHK",
        preferred_locations="Thane West",
        min_budget=28000.0,
        max_budget=32000.0,
        furnishing="Semi-Furnished",
        move_in_date="Immediate",
        status="Visit Scheduled",
        notes="Family of 3, husband works in Powai, looking for good connectivity."
    )
    l2 = LeadCreate(
        name="Priya Deshmukh",
        phone="9823456789",
        client_type="Buyer",
        preferred_bhk="3 BHK",
        preferred_locations="Kolshet Road, Thane West",
        min_budget=16000000.0,
        max_budget=18500000.0,
        furnishing="Any",
        move_in_date="Within 1 month",
        status="Contacted",
        notes="High net-worth IT Director looking for gated luxury society with amenities."
    )
    l3 = LeadCreate(
        name="Amit Patel",
        phone="9765432109",
        client_type="Tenant",
        preferred_bhk="1 BHK",
        preferred_locations="Ghodbunder Road, Thane West",
        min_budget=20000.0,
        max_budget=25000.0,
        furnishing="Fully Furnished",
        move_in_date="Immediate",
        status="New",
        notes="Single bachelor working in IT park, needs ready-to-move furnished flat."
    )

    excel_db.add_lead(l1)
    excel_db.add_lead(l2)
    excel_db.add_lead(l3)

    print(f"Successfully seeded database! Excel file: {excel_db.file_path}")

if __name__ == "__main__":
    seed()
