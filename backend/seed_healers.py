"""
Seed script: reads frontend/public/healers.json and inserts records into MongoDB.
Run once:  python seed_healers.py
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

HEALERS_JSON = ROOT_DIR.parent / "frontend" / "public" / "healers.json"


def seed():
    if not HEALERS_JSON.exists():
        print(f"ERROR: {HEALERS_JSON} not found.")
        sys.exit(1)

    with open(HEALERS_JSON, "r", encoding="utf-8") as f:
        healers = json.load(f)

    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db["healers"]

    # Avoid duplicates: drop existing collection before seeding
    existing_count = collection.count_documents({})
    if existing_count > 0:
        print(f"Collection already has {existing_count} documents.")
        answer = input("Drop and re-seed? (y/n): ").strip().lower()
        if answer != "y":
            print("Aborted.")
            client.close()
            return

        collection.drop()
        print("Dropped existing collection.")

    result = collection.insert_many(healers)
    print(f"Successfully seeded {len(result.inserted_ids)} healers into '{DB_NAME}.healers'.")

    # Create an index on the 'id' field for fast lookups
    collection.create_index("id", unique=True)
    print("Created unique index on 'id' field.")

    client.close()


if __name__ == "__main__":
    seed()
