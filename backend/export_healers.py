"""Export all healers from MongoDB to frontend/public/healers.json for offline fallback."""
import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

HEALERS_JSON = ROOT_DIR.parent / "frontend" / "public" / "healers.json"

async def export_healers():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']

    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
    db = client[db_name]

    print(f"Connecting to MongoDB ({db_name})...")
    docs = await db.healers.find({}, {"_id": 0}).to_list(10_000)
    print(f"Found {len(docs)} healers in MongoDB.")

    if not docs:
        print("ERROR: No healers found in MongoDB! Aborting to avoid overwriting existing JSON.")
        client.close()
        return

    # Ensure all healers have the expected fields
    for doc in docs:
        doc.setdefault("name", "")
        doc.setdefault("specialisation", "General")
        doc.setdefault("lat", 0)
        doc.setdefault("lng", 0)
        doc.setdefault("contact", None)
        doc.setdefault("address", None)
        doc.setdefault("taluka", None)
        doc.setdefault("district", None)
        doc.setdefault("pincode", None)
        doc.setdefault("uid", None)
        doc.setdefault("validity", None)
        doc.setdefault("photo_url", None)
        doc.setdefault("video_url", None)

    # Sort by id
    docs.sort(key=lambda h: h.get("id", 0))

    with open(HEALERS_JSON, "w", encoding="utf-8") as f:
        json.dump(docs, f, indent=2, ensure_ascii=False)

    print(f"Exported {len(docs)} healers to {HEALERS_JSON}")
    client.close()

if __name__ == "__main__":
    asyncio.run(export_healers())
