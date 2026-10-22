import os
import shutil
import asyncio
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

from app.parser import parse_whatsapp_text, parse_zip_archive
from app.excel_db import excel_db
from app.models import Property

WATCH_FOLDER = Path(__file__).resolve().parent.parent.parent / "input_messages"
PROCESSED_FOLDER = WATCH_FOLDER / "processed"

def ensure_folders():
    WATCH_FOLDER.mkdir(parents=True, exist_ok=True)
    PROCESSED_FOLDER.mkdir(parents=True, exist_ok=True)

def process_single_file(file_path: Path) -> List[Property]:
    """
    Processes a single .txt, .md, or .zip file from the input folder,
    parses listings, adds them to Excel, and archives the file.
    """
    added_properties: List[Property] = []
    lower_name = file_path.name.lower()
    
    if not file_path.is_file() or file_path.parent == PROCESSED_FOLDER:
        return added_properties

    try:
        if lower_name.endswith(".zip"):
            with open(file_path, "rb") as f:
                zip_bytes = f.read()
            total_msgs, listings = parse_zip_archive(zip_bytes, filename=file_path.name)
            for prop_create in listings:
                prop_create.source = f"Folder Watcher (Zip: {file_path.name})"
                added = excel_db.add_property(prop_create)
                added_properties.append(added)
        
        elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            listings = parse_whatsapp_text(content, source_label=f"Folder Watcher ({file_path.name})")
            for prop_create in listings:
                added = excel_db.add_property(prop_create)
                added_properties.append(added)

        # Move to processed folder with timestamp prefix
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        dest = PROCESSED_FOLDER / f"{timestamp}_{file_path.name}"
        shutil.move(str(file_path), str(dest))
        print(f"[Folder Watcher] Processed '{file_path.name}' -> Added {len(added_properties)} properties. Archived to '{dest.name}'.")

    except Exception as e:
        print(f"[Folder Watcher] Error processing '{file_path.name}': {e}")

    return added_properties

def scan_watch_folder() -> Dict[str, Any]:
    """Scans the watch folder for any pending files and processes them."""
    ensure_folders()
    processed_count = 0
    all_added: List[Property] = []

    for item in WATCH_FOLDER.iterdir():
        if item.is_file() and item.suffix.lower() in [".txt", ".md", ".zip"]:
            added = process_single_file(item)
            all_added.extend(added)
            processed_count += 1

    return {
        "files_scanned": processed_count,
        "properties_added": len(all_added),
        "items": all_added
    }

async def start_folder_watcher_loop(interval_seconds: int = 5):
    """Background loop that periodically checks the watched folder."""
    ensure_folders()
    print(f"[Folder Watcher] Started monitoring: {WATCH_FOLDER}")
    while True:
        try:
            scan_watch_folder()
        except Exception as e:
            print(f"[Folder Watcher] Loop error: {e}")
        await asyncio.sleep(interval_seconds)
