# IRA Real Estate Property Management & CRM System

A full-stack Real Estate Property Management and CRM Web Application tailored for Indian real estate brokers and property agencies. Built with a direct **Excel Database (`real_estate_database.xlsx`)**, automated **WhatsApp Message & ZIP Export Parser**, and an **Intelligent Property-Client Matchmaking Engine**.

---

## 🌟 Key Features

### 1. Direct Excel Database (`real_estate_database.xlsx`)
- **No SQL setup required**: All data is stored in native `.xlsx` format under `data/real_estate_database.xlsx`.
- **Dual Tab Architecture**:
  - `Properties`: Listing type (Rent/Sale), BHK, Building Name, Location/Area, Furnishing, Rent/Price, Deposit, Features, Contact Numbers, Agency, Status.
  - `Clients_CRM`: Prospective buyer & tenant profiles, desired BHK, target localities, budget ranges, move-in timelines, pipeline stages, and follow-up notes.
- **Thread-safe**: Protected by threading locks with safe backup saving and live download button in the web UI.

### 2. WhatsApp Ingestion & Parser Engine
- **Three Ingestion Modes**:
  1. **Direct Copy-Paste**: Paste raw WhatsApp listings from WhatsApp Web or phone with real-time field extraction preview.
  2. **WhatsApp ZIP Chat Export**: Drag-and-drop the `.zip` archive exported from WhatsApp. Unpacks in memory, filters out casual chat/links/media, and extracts only valid listings.
  3. **Automated Folder Watcher**: Place any `.zip` or `.txt` file into `input_messages/` — the daemon automatically parses and writes them to Excel, moving processed files to `input_messages/processed/`.
- **Field Extraction Logic**:
  - Handles emojis, Indian number formatting (e.g., `30,000/-`, `30k`, `1.85 Cr`), deposit calculation (e.g. `6 Months Rent` $\rightarrow$ ₹1,80,000), 10-digit mobile numbers, and brokerage agency tagging.

### 3. Prospective Clients CRM
- Track prospective **Tenants** and **Buyers** through their lifecycle:
  - *New Lead $\rightarrow$ Contacted $\rightarrow$ Visit Scheduled $\rightarrow$ Closed $\rightarrow$ Dropped*
- Captures exact client preferences (budget range, preferred BHKs, localities).
- Live status updater directly syncs with the Excel workbook.

### 4. Smart Property-Client Matchmaking Engine
- **Bidirectional Matching**:
  - Match Available Properties for a given Client Lead.
  - Find Interested Client Leads for a newly added Property.
- **Compatibility Scoring (0-100%)**:
  - Transaction Type Match (Rent vs Sale)
  - BHK Compatibility (Exact or Adjacent)
  - Locality & Proximity Match
  - Budget Tolerance Fit
  - Furnishing Compatibility
- **1-Click WhatsApp Pitch Generator**:
  - Automatically formats an engaging property pitch.
  - Includes a direct "Send via WhatsApp" button (`https://wa.me/...`) to message the client in one click.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root:
```bat
start.bat
```
This automatically starts the FastAPI backend and opens `http://localhost:8000` in your default web browser.

### Option 2: Python Command Line
Ensure dependencies are installed:
```bash
python -m pip install -r backend/requirements.txt
```

Start the application:
```bash
python backend/run.py
```
Open your browser to: **`http://localhost:8000`**

---

## 🛠️ Tech Stack

- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic v2
- **Database**: Excel (`openpyxl`, `pandas`)
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Folder Watching**: Async background watcher (`input_messages/`)
- **Chat Parsing**: RegEx + NLP heuristics for Indian real estate message templates

---

## 📁 Project Directory Layout

```
internship/
├── start.bat                     # One-click Windows launch script
├── README.md                     # Documentation
├── input_messages/               # Folder watched for incoming WhatsApp .zip / .txt files
│   └── processed/                # Archive for processed files
├── data/
│   └── real_estate_database.xlsx # Active Excel database
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI endpoints & static frontend serving
│   │   ├── excel_db.py           # Thread-safe Excel read/write manager
│   │   ├── parser.py             # WhatsApp stream splitter, classifier & extractor
│   │   ├── matcher.py            # Compatibility scoring & pitch generator
│   │   ├── folder_watcher.py     # Background filesystem monitor
│   │   └── models.py             # Pydantic data schemas
│   ├── tests/
│   │   ├── test_parser.py        # Parser unit tests
│   │   └── test_api_e2e.py       # End-to-end integration tests
│   ├── seed_data.py              # Sample data generator
│   ├── requirements.txt
│   └── run.py                    # Server startup script
└── frontend/
    ├── src/
    │   ├── api.js                # API service
    │   ├── App.jsx               # Main dashboard layout
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── PropertiesView.jsx
    │       ├── PropertyModal.jsx
    │       ├── LeadsView.jsx
    │       ├── LeadModal.jsx
    │       ├── WhatsAppIngestView.jsx
    │       ├── SmartMatcherView.jsx
    │       └── MatchModal.jsx
    └── dist/                     # Production build served by FastAPI
```

---

## 🧪 Running Tests

To run the unit and integration test suite:

```bash
# 1. Run parser & regex verification with Ishwar Kaka's sample
python backend/tests/test_parser.py

# 2. Run end-to-end API, database, and matching tests
python backend/tests/test_api_e2e.py
```
