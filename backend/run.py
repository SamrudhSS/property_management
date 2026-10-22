import sys
import uvicorn
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    print(f"Starting Real Estate CRM Backend on http://localhost:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
