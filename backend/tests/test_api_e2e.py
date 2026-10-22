import sys
from pathlib import Path
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.excel_db import excel_db

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("✓ API Health Check: OK")

def test_database_info():
    res = client.get("/api/database/info")
    assert res.status_code == 200
    data = res.json()
    assert data["exists"] is True
    assert data["total_properties"] >= 3
    assert data["total_leads"] >= 3
    print(f"✓ Database Info: {data['total_properties']} properties, {data['total_leads']} leads in Excel")

def test_properties_crud():
    # List
    res = client.get("/api/properties")
    assert res.status_code == 200
    props = res.json()
    assert len(props) >= 3
    print(f"✓ Retrieved {len(props)} properties from Excel sheet")

    # Filter
    res_filtered = client.get("/api/properties?listing_type=Rent")
    assert res_filtered.status_code == 200
    rent_props = res_filtered.json()
    assert all(p["listing_type"] == "Rent" for p in rent_props)
    print(f"✓ Filtered {len(rent_props)} Rent properties")

def test_leads_crud():
    res = client.get("/api/leads")
    assert res.status_code == 200
    leads = res.json()
    assert len(leads) >= 3
    print(f"✓ Retrieved {len(leads)} CRM leads from Excel sheet")

def test_whatsapp_text_ingest():
    sample = """🟩 AVAILABLE 2 BHK FLAT FOR RENT 

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

 *IRA PROPERTY"""

    res = client.post("/api/ingest/text", data={"text": sample})
    assert res.status_code == 200
    data = res.json()
    assert data["properties_added"] >= 1
    added_prop = data["items"][0]
    assert added_prop["bhk"] == "2 BHK"
    assert added_prop["building_name"] == "Hill Crest"
    assert "Thane West" in added_prop["location_area"]
    assert added_prop["rent_price"] == 30000.0
    print(f"✓ WhatsApp Ingestion: Successfully parsed and committed {added_prop['id']} to Excel")

def test_matchmaking():
    leads = client.get("/api/leads").json()
    tenant_lead = next(l for l in leads if l["client_type"] == "Tenant")
    res = client.get(f"/api/leads/{tenant_lead['id']}/matches")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match["score"] >= 80
    assert "whatsapp_pitch" in top_match
    print(f"✓ Matchmaking: Top match for {tenant_lead['name']} has score {top_match['score']}%")
    print(f"✓ Pitch generated:\n---\n{top_match['whatsapp_pitch']}\n---")

def test_frontend_serving():
    res = client.get("/")
    assert res.status_code == 200
    assert "<html" in res.text.lower()
    print("✓ Frontend Single-Page App served from FastAPI root route")

if __name__ == "__main__":
    test_health()
    test_database_info()
    test_properties_crud()
    test_leads_crud()
    test_whatsapp_text_ingest()
    test_matchmaking()
    test_frontend_serving()
    print("\nALL END-TO-END SYSTEM TESTS PASSED SUCCESSFULLY!")
