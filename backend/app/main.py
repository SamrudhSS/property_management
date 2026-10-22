import os
import asyncio
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.models import (
    Property, PropertyCreate, PropertyUpdate,
    Lead, LeadCreate, LeadUpdate,
    MatchItem, IngestionResult
)
from app.excel_db import excel_db, DEFAULT_DB_PATH
from app.parser import parse_whatsapp_text, parse_zip_archive
from app.matcher import match_properties_for_lead, match_leads_for_property
from app.folder_watcher import (
    start_folder_watcher_loop, scan_watch_folder, WATCH_FOLDER, PROCESSED_FOLDER
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure DB and folders exist, start folder watcher in background
    excel_db._ensure_workbook()
    WATCH_FOLDER.mkdir(parents=True, exist_ok=True)
    PROCESSED_FOLDER.mkdir(parents=True, exist_ok=True)
    watcher_task = asyncio.create_task(start_folder_watcher_loop(interval_seconds=5))
    yield
    # Shutdown
    watcher_task.cancel()

app = FastAPI(
    title="Real Estate Property Management & CRM API",
    description="Real Estate Property Management system with WhatsApp parser, CRM, and Excel Database.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- System & Excel File Endpoints ---------------- #

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "real-estate-crm-api"}

@app.get("/api/database/info")
def get_database_info():
    props = excel_db.get_all_properties()
    leads = excel_db.get_all_leads()
    return {
        "file_path": str(DEFAULT_DB_PATH),
        "exists": DEFAULT_DB_PATH.exists(),
        "total_properties": len(props),
        "available_properties": len([p for p in props if p.status.lower() == "available"]),
        "total_leads": len(leads),
        "active_leads": len([l for l in leads if l.status.lower() not in ["closed", "dropped"]])
    }

@app.get("/api/database/download")
def download_excel_database():
    if not DEFAULT_DB_PATH.exists():
        raise HTTPException(status_code=404, detail="Excel database not created yet")
    return FileResponse(
        path=str(DEFAULT_DB_PATH),
        filename="real_estate_database.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# ---------------- Properties Endpoints ---------------- #

@app.get("/api/properties", response_model=List[Property])
def list_properties(
    search: Optional[str] = Query(None, description="Search across building, location, features"),
    listing_type: Optional[str] = Query(None, description="Rent or Sale"),
    bhk: Optional[str] = Query(None, description="1 BHK, 2 BHK, etc."),
    location: Optional[str] = Query(None, description="Location filter"),
    status: Optional[str] = Query(None, description="Available, Rented, Sold"),
    max_price: Optional[float] = Query(None, description="Maximum rent or price")
):
    props = excel_db.get_all_properties()

    if listing_type:
        props = [p for p in props if p.listing_type.lower() == listing_type.lower()]
    if bhk:
        props = [p for p in props if bhk.lower() in p.bhk.lower()]
    if location:
        props = [p for p in props if location.lower() in (f"{p.building_name} {p.location_area}").lower()]
    if status:
        props = [p for p in props if p.status.lower() == status.lower()]
    if max_price:
        props = [p for p in props if p.rent_price <= max_price]
    if search:
        s = search.lower()
        props = [
            p for p in props if s in (
                f"{p.id} {p.building_name} {p.location_area} {p.bhk} {p.features} {p.contact_numbers} {p.agency}"
            ).lower()
        ]

    # Return reverse sorted by date / id so newest appears first
    return sorted(props, key=lambda x: x.id, reverse=True)

@app.get("/api/properties/{prop_id}", response_model=Property)
def get_property(prop_id: str):
    p = excel_db.get_property(prop_id)
    if not p:
        raise HTTPException(status_code=404, detail="Property not found")
    return p

@app.post("/api/properties", response_model=Property)
def create_property(prop: PropertyCreate):
    return excel_db.add_property(prop)

@app.put("/api/properties/{prop_id}", response_model=Property)
def update_property(prop_id: str, update: PropertyUpdate):
    updated = excel_db.update_property(prop_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Property not found")
    return updated

@app.delete("/api/properties/{prop_id}")
def delete_property(prop_id: str):
    success = excel_db.delete_property(prop_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"success": True, "message": f"Property {prop_id} deleted from Excel database"}

@app.get("/api/properties/{prop_id}/matches", response_model=List[MatchItem])
def get_property_matches(prop_id: str, min_score: int = 50):
    prop = excel_db.get_property(prop_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    leads = excel_db.get_all_leads()
    return match_leads_for_property(prop, leads, min_score=min_score)

# ---------------- Leads / CRM Endpoints ---------------- #

@app.get("/api/leads", response_model=List[Lead])
def list_leads(
    search: Optional[str] = Query(None),
    client_type: Optional[str] = Query(None, description="Tenant or Buyer"),
    status: Optional[str] = Query(None)
):
    leads = excel_db.get_all_leads()
    if client_type:
        leads = [l for l in leads if l.client_type.lower() == client_type.lower()]
    if status:
        leads = [l for l in leads if l.status.lower() == status.lower()]
    if search:
        s = search.lower()
        leads = [
            l for l in leads if s in (
                f"{l.id} {l.name} {l.phone} {l.preferred_bhk} {l.preferred_locations} {l.notes}"
            ).lower()
        ]
    return sorted(leads, key=lambda x: x.id, reverse=True)

@app.get("/api/leads/{lead_id}", response_model=Lead)
def get_lead(lead_id: str):
    lead = excel_db.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.post("/api/leads", response_model=Lead)
def create_lead(lead: LeadCreate):
    return excel_db.add_lead(lead)

@app.put("/api/leads/{lead_id}", response_model=Lead)
def update_lead(lead_id: str, update: LeadUpdate):
    updated = excel_db.update_lead(lead_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: str):
    success = excel_db.delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": f"Lead {lead_id} deleted from Excel database"}

@app.get("/api/leads/{lead_id}/matches", response_model=List[MatchItem])
def get_lead_matches(lead_id: str, min_score: int = 50):
    lead = excel_db.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    props = excel_db.get_all_properties()
    return match_properties_for_lead(lead, props, min_score=min_score)

# ---------------- Ingestion & Parser Endpoints ---------------- #

@app.post("/api/ingest/preview")
def preview_whatsapp_text(text: str = Form(...)):
    """Parses text without committing to Excel, so user can verify."""
    listings = parse_whatsapp_text(text, source_label="UI Preview")
    return {
        "listings_found": len(listings),
        "items": [l.model_dump() for l in listings]
    }

@app.post("/api/ingest/text", response_model=IngestionResult)
def ingest_whatsapp_text(text: str = Form(...)):
    """Parses WhatsApp text and appends each property into the Excel database."""
    listings = parse_whatsapp_text(text, source_label="WhatsApp Web Import")
    added = []
    for l in listings:
        p = excel_db.add_property(l)
        added.append(p)
    return IngestionResult(
        total_messages_scanned=1,
        listings_detected=len(listings),
        properties_added=len(added),
        duplicates_skipped=0,
        items=added
    )

@app.post("/api/ingest/file", response_model=IngestionResult)
async def ingest_file(file: UploadFile = File(...)):
    """Accepts .zip or .txt chat export, parses listings and adds them to Excel."""
    content = await file.read()
    filename = file.filename.lower()
    added = []
    scanned_count = 0

    if filename.endswith(".zip"):
        scanned_count, listings = parse_zip_archive(content, filename=file.filename)
        for l in listings:
            p = excel_db.add_property(l)
            added.append(p)
    elif filename.endswith(".txt") or filename.endswith(".md"):
        text_content = content.decode("utf-8", errors="replace")
        listings = parse_whatsapp_text(text_content, source_label=f"File: {file.filename}")
        scanned_count = len(listings)
        for l in listings:
            p = excel_db.add_property(l)
            added.append(p)
    else:
        raise HTTPException(status_code=400, detail="Only .zip, .txt, or .md files are supported")

    return IngestionResult(
        total_messages_scanned=scanned_count,
        listings_detected=len(added),
        properties_added=len(added),
        duplicates_skipped=0,
        items=added
    )

@app.post("/api/watcher/scan-now")
def trigger_watcher_scan():
    """Manually triggers an immediate scan of the input_messages folder."""
    result = scan_watch_folder()
    return result

@app.get("/api/watcher/status")
def get_watcher_status():
    files = [f.name for f in WATCH_FOLDER.iterdir() if f.is_file()]
    processed_count = len(list(PROCESSED_FOLDER.iterdir())) if PROCESSED_FOLDER.exists() else 0
    return {
        "watch_folder": str(WATCH_FOLDER),
        "pending_files": files,
        "total_archived_files": processed_count
    }

# ---------------- Static Frontend Serving (if built) ---------------- #
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

