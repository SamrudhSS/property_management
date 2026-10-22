import sys
import os
import shutil
import zipfile
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.excel_db import ExcelDatabase, DEFAULT_DB_PATH

def reset_mock_data():
    print("1. Resetting database to clean state (removing all mock rows)...")
    if DEFAULT_DB_PATH.exists():
        DEFAULT_DB_PATH.unlink()
    
    # Re-initialize fresh empty Excel workbook with headers only
    db = ExcelDatabase(DEFAULT_DB_PATH)
    print(f"✓ Excel database reset at: {DEFAULT_DB_PATH}")
    print(f"✓ Total properties: {len(db.get_all_properties())}")
    print(f"✓ Total leads: {len(db.get_all_leads())}")

    # Remove temporary extraction folder if exists
    sample_dir = Path(__file__).resolve().parent / "sample_chat_export"
    if sample_dir.exists():
        shutil.rmtree(sample_dir)
        print("✓ Removed temporary sample_chat_export directory")

    # Clean input_messages/processed
    processed_dir = Path(__file__).resolve().parent / "input_messages" / "processed"
    if processed_dir.exists():
        for f in processed_dir.iterdir():
            if f.is_file():
                f.unlink()
        print("✓ Cleaned input_messages/processed folder")

def create_real_test_zip():
    print("\n2. Creating realistic WhatsApp chat export ZIP file for testing...")
    
    chat_content = """Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[28/09/26, 9:15:20 AM] Rajesh Broker: Good morning all members. Looking for 2 BHK in Thane West for immediate family client.
[28/09/26, 9:22:11 AM] Nilesh Realtor: I have one option in Majiwada, will share details soon.
[28/09/26, 11:39:00 AM] Ishwar Kaka: 🟩 AVAILABLE 2 BHK FLAT FOR RENT 

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

 *IRA PROPERTY*
[28/09/26, 11:42:30 AM] Rajesh Broker: Thanks Ishwar ji, key is with whom?
[28/09/26, 11:43:10 AM] Ishwar Kaka: Key with security, can visit anytime today after 2 PM.
[28/09/26, 1:15:45 PM] Aakash Realty: 🏠 1 BHK FLAT FOR RENT IN THANE

📍 Location: Hiranandani Estate, Ghodbunder Road

🛋️ Fully Furnished Flat
   - AC, Double Bed, Wardrobe
   - Modular Kitchen, Refrigerator
   - TV Unit & Sofa

💰 Rent: 24,000/- per month
💵 Deposit: 1,00,000/-

Call for Inspection:
📞 9820112233
📞 9820445566
*AAKASH PROPERTIES*
[28/09/26, 2:40:15 PM] Sunil Estate: <image omitted>
[28/09/26, 2:41:00 PM] Sunil Estate: [Forwarded] Please check attached layout plan.
[28/09/26, 3:30:22 PM] IRA Property: 🏢 LUXURY 3 BHK FLAT FOR SALE

📍 Location: Lodha Amara, Kolshet Road, Thane West

✨ Grand Clubhouse, Swimming Pool, Gym
✨ 2 Covered Car Parkings
✨ High Floor Garden Facing

💰 Price: 1.75 Cr (Negotiable)
Possession: Ready to move

Contact:
📞 9819001122
*IRA PROPERTY*
[28/09/26, 4:10:05 PM] Vikram: Any client for 2 BHK in Mulund?
[28/09/26, 5:00:12 PM] Ishwar Kaka: Deal closed for Hill Crest client visit scheduled for tomorrow.
"""

    zip_path = Path(__file__).resolve().parent / "WhatsApp Chat - Thane Brokers Network.zip"
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Standard WhatsApp export filename inside zip
        zf.writestr("_chat.txt", chat_content)
    
    print(f"✓ Created realistic test archive: {zip_path.name}")
    print(f"✓ Archive size: {zip_path.stat().st_size} bytes")
    print(f"✓ Contains realistic chat conversation with 3 actual property listings + conversational noise.")
    return zip_path

if __name__ == "__main__":
    reset_mock_data()
    create_real_test_zip()
