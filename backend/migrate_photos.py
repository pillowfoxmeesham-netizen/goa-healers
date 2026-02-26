"""Migrate existing uploaded photos from disk to photos.json (base64 format)."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).parent
UPLOADS_DIR = ROOT / "uploads"
PHOTOS_FILE = ROOT / "photos.json"
HEALERS_JSON = ROOT.parent / "frontend" / "public" / "healers.json"

EXT_TO_CT = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
}

def migrate():
    files = list(UPLOADS_DIR.glob("*")) if UPLOADS_DIR.exists() else []
    if not files:
        print("No files in uploads/ to migrate.")
        return

    photos = {}
    for f in files:
        ext = f.suffix.lower()
        if ext not in EXT_TO_CT:
            continue
        healer_id = f.name.split("_")[0]
        b64 = base64.b64encode(f.read_bytes()).decode("utf-8")
        photos[healer_id] = {"data": b64, "content_type": EXT_TO_CT[ext]}
        print(f"  Migrated {f.name} -> healer {healer_id} ({len(b64)} chars)")

    with open(PHOTOS_FILE, "w", encoding="utf-8") as pf:
        json.dump(photos, pf, indent=2)
    print(f"Wrote {len(photos)} photo(s) to photos.json")

    # Update healers.json photo_url references
    if HEALERS_JSON.exists():
        healers = json.loads(HEALERS_JSON.read_text(encoding="utf-8"))
        changed = 0
        for h in healers:
            url = h.get("photo_url", "")
            if "/uploads/" in url:
                h["photo_url"] = "/api/healers/" + str(h["id"]) + "/photo"
                changed += 1
        HEALERS_JSON.write_text(json.dumps(healers, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Updated {changed} photo_url(s) in healers.json")

if __name__ == "__main__":
    migrate()
