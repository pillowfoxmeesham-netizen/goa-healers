from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import base64
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000,
)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ── Existing Models ──────────────────────────────────────────────────────────

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# ── Healer Models ────────────────────────────────────────────────────────────

class Healer(BaseModel):
    """Full healer document returned from the API."""
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    specialisation: str
    lat: float
    lng: float
    contact: Optional[str] = None
    address: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    uid: Optional[str] = None
    validity: Optional[str] = None
    photo_url: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None


class HealerCreate(BaseModel):
    """Request body for creating / updating a healer (id is auto-assigned)."""
    name: str
    specialisation: str
    lat: float
    lng: float
    contact: Optional[str] = None
    address: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    uid: Optional[str] = None
    validity: Optional[str] = None
    photo_url: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None


# ── Rating Models ────────────────────────────────────────────────────────────

class RatingCreate(BaseModel):
    """Request body for submitting a rating."""
    score: int = Field(ge=1, le=5)


class RatingAggregation(BaseModel):
    """Aggregate rating info returned by the API."""
    average: float
    count: int


# ── Helper: auto-increment id ────────────────────────────────────────────────

async def _next_healer_id() -> int:
    """Return max(id) + 1 from the healers collection."""
    pipeline = [{"$group": {"_id": None, "max_id": {"$max": "$id"}}}]
    cursor = db.healers.aggregate(pipeline)
    result = await cursor.to_list(1)
    if result and result[0]["max_id"] is not None:
        return result[0]["max_id"] + 1
    return 1


# ── Local Ratings Storage (JSON file) ────────────────────────────────────────
# Ratings are stored locally in ratings.json so they work reliably
# even when MongoDB Atlas is unreachable.

RATINGS_FILE = ROOT_DIR / "ratings.json"
HEALERS_JSON = ROOT_DIR.parent / "frontend" / "public" / "healers.json"


def _load_ratings() -> dict:
    """Load ratings from local JSON file. Returns {"healer_id": [scores]}."""
    if RATINGS_FILE.exists():
        try:
            with open(RATINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_ratings(ratings: dict):
    """Save ratings to local JSON file."""
    with open(RATINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(ratings, f, indent=2)


def _get_all_aggregates() -> dict:
    """Get aggregate ratings for all healers from local file."""
    ratings = _load_ratings()
    result = {}
    for hid, scores in ratings.items():
        if scores:
            avg: float = sum(scores) / len(scores)
            result[int(hid)] = {
                "avg_rating": round(avg, 1),
                "rating_count": len(scores),
            }
    return result


# ── Existing Routes ──────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ── Healer CRUD Routes ───────────────────────────────────────────────────────

@api_router.get("/healers")
async def list_healers():
    """Return all healers with their aggregate ratings."""
    # Try MongoDB first, fall back to static JSON file
    try:
        docs = await db.healers.find({}, {"_id": 0}).to_list(10_000)
        if not docs:
            raise Exception("No healers in MongoDB")
    except Exception as e:
        logger.warning(f"MongoDB unavailable for healers, using healers.json: {e}")
        if HEALERS_JSON.exists():
            with open(HEALERS_JSON, "r", encoding="utf-8") as f:
                docs = json.load(f)
        else:
            docs = []

    # Merge local ratings
    aggregates = _get_all_aggregates()
    for doc in docs:
        info = aggregates.get(doc["id"], {"avg_rating": 0, "rating_count": 0})
        doc["avg_rating"] = info["avg_rating"]
        doc["rating_count"] = info["rating_count"]

    return docs


@api_router.get("/healers/{healer_id}", response_model=Healer)
async def get_healer(healer_id: int):
    """Return a single healer by id."""
    doc = await db.healers.find_one({"id": healer_id}, {"_id": 0})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Healer with id {healer_id} not found")
    return doc


@api_router.post("/healers", status_code=201)
async def create_healer(payload: HealerCreate):
    """Create a new healer. Falls back to local JSON if MongoDB is down."""
    healer_data = payload.model_dump()

    try:
        new_id = await _next_healer_id()
        healer = Healer.model_validate({"id": new_id, **healer_data})
        doc = healer.model_dump()
        await db.healers.insert_one(doc)
        logger.info(f"Healer created in MongoDB with id {new_id}")
        return healer
    except Exception as e:
        logger.warning(f"MongoDB unavailable for create, using healers.json: {e}")
        # Fall back to local JSON file
        if HEALERS_JSON.exists():
            with open(HEALERS_JSON, "r", encoding="utf-8") as f:
                healers = json.load(f)
        else:
            healers = []

        # Auto-increment id
        max_id = max((h["id"] for h in healers), default=0)
        new_id = max_id + 1
        healer_data["id"] = new_id

        healers.append(healer_data)
        with open(HEALERS_JSON, "w", encoding="utf-8") as f:
            json.dump(healers, f, indent=2, ensure_ascii=False)

        logger.info(f"Healer created in healers.json with id {new_id}")
        return healer_data


@api_router.put("/healers/{healer_id}", response_model=Healer)
async def update_healer(healer_id: int, payload: HealerCreate):
    """Update an existing healer by id."""
    existing = await db.healers.find_one({"id": healer_id})
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Healer with id {healer_id} not found")

    update_data = payload.model_dump()
    await db.healers.update_one({"id": healer_id}, {"$set": update_data})

    updated = await db.healers.find_one({"id": healer_id}, {"_id": 0})
    return updated


@api_router.delete("/healers/{healer_id}", status_code=204)
async def delete_healer(healer_id: int):
    """Delete a healer by id. Falls back to local JSON if MongoDB is down."""
    try:
        result = await db.healers.delete_one({"id": healer_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"Healer with id {healer_id} not found")
        logger.info(f"Healer {healer_id} deleted from MongoDB")
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"MongoDB unavailable for delete, using healers.json: {e}")
        if HEALERS_JSON.exists():
            with open(HEALERS_JSON, "r", encoding="utf-8") as f:
                healers = json.load(f)
            original_len = len(healers)
            healers = [h for h in healers if h["id"] != healer_id]
            if len(healers) == original_len:
                raise HTTPException(status_code=404, detail=f"Healer with id {healer_id} not found")
            with open(HEALERS_JSON, "w", encoding="utf-8") as f:
                json.dump(healers, f, indent=2, ensure_ascii=False)
            logger.info(f"Healer {healer_id} deleted from healers.json")
        else:
            raise HTTPException(status_code=404, detail=f"Healer with id {healer_id} not found")
    return None


# ── Import Healers from Excel ────────────────────────────────────────────────

@api_router.post("/healers/import")
async def import_healers_excel(file: UploadFile = File(...)):
    """Bulk-import healers from an Excel file matching the export format."""
    import openpyxl
    from io import BytesIO

    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files are supported")

    contents = await file.read()
    try:
        wb = openpyxl.load_workbook(BytesIO(contents), read_only=True, data_only=True)
        ws = wb.active
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read Excel file: {e}")

    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        raise HTTPException(status_code=400, detail="Excel file must have a header row and at least one data row")

    # Normalise header names to lowercase for flexible matching
    raw_headers = [str(h).strip().lower() if h else '' for h in rows[0]]

    # Map expected column names → field names
    col_map = {
        'name': 'name',
        'specialisation': 'specialisation',
        'specialization': 'specialisation',
        'latitude': 'lat',
        'lat': 'lat',
        'longitude': 'lng',
        'lng': 'lng',
        'contact': 'contact',
        'address': 'address',
        'taluka': 'taluka',
        'district': 'district',
        'pincode': 'pincode',
        'uid': 'uid',
        'validity': 'validity',
    }

    # Build column index → field name map
    field_indices = {}
    for idx, header in enumerate(raw_headers):
        if header in col_map:
            field_indices[idx] = col_map[header]

    required_fields = {'name', 'specialisation', 'lat', 'lng'}
    found_fields = set(field_indices.values())
    missing = required_fields - found_fields
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}. "
                   f"Expected columns: Name, Specialisation, Latitude, Longitude"
        )

    imported = []
    errors = []

    for row_num, row in enumerate(rows[1:], start=2):
        try:
            healer_data = {}
            for idx, field in field_indices.items():
                val = row[idx] if idx < len(row) else None
                if val is not None:
                    val = str(val).strip() if not isinstance(val, (int, float)) else val
                healer_data[field] = val

            # Validate required fields
            if not healer_data.get('name') or not healer_data.get('specialisation'):
                errors.append(f"Row {row_num}: Name and Specialisation are required")
                continue

            # Parse lat/lng as floats
            try:
                healer_data['lat'] = float(healer_data.get('lat', 0))
                healer_data['lng'] = float(healer_data.get('lng', 0))
            except (ValueError, TypeError):
                errors.append(f"Row {row_num}: Invalid Latitude/Longitude values")
                continue

            if healer_data['lat'] == 0 and healer_data['lng'] == 0:
                errors.append(f"Row {row_num}: Latitude and Longitude cannot both be 0")
                continue

            # Convert optional fields to strings (they may be numbers from Excel)
            for field in ['contact', 'pincode', 'uid']:
                if field in healer_data and healer_data[field] is not None:
                    healer_data[field] = str(healer_data[field])
                    # Clean up .0 from Excel number formatting
                    if healer_data[field].endswith('.0'):
                        healer_data[field] = healer_data[field][:-2]

            imported.append(healer_data)
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")

    wb.close()

    if not imported:
        raise HTTPException(
            status_code=400,
            detail=f"No valid healers found. Errors: {'; '.join(errors)}"
        )

    # Insert into MongoDB (with JSON fallback)
    inserted_count = 0
    try:
        next_id = await _next_healer_id()
        for healer_data in imported:
            healer_data['id'] = next_id
            healer_data.setdefault('contact', None)
            healer_data.setdefault('address', None)
            healer_data.setdefault('taluka', None)
            healer_data.setdefault('district', None)
            healer_data.setdefault('pincode', None)
            healer_data.setdefault('uid', None)
            healer_data.setdefault('validity', None)
            healer_data.setdefault('photo_url', None)
            await db.healers.insert_one(healer_data)
            next_id += 1
            inserted_count += 1
        logger.info(f"Imported {inserted_count} healers into MongoDB")
    except Exception as e:
        logger.warning(f"MongoDB unavailable for import, using healers.json: {e}")
        if HEALERS_JSON.exists():
            with open(HEALERS_JSON, "r", encoding="utf-8") as f:
                healers = json.load(f)
        else:
            healers = []
        max_id = max((h["id"] for h in healers), default=0)
        for healer_data in imported:
            max_id += 1
            healer_data['id'] = max_id
            healer_data.setdefault('contact', None)
            healer_data.setdefault('address', None)
            healer_data.setdefault('taluka', None)
            healer_data.setdefault('district', None)
            healer_data.setdefault('pincode', None)
            healer_data.setdefault('uid', None)
            healer_data.setdefault('validity', None)
            healer_data.setdefault('photo_url', None)
            healers.append(healer_data)
            inserted_count += 1
        with open(HEALERS_JSON, "w", encoding="utf-8") as f:
            json.dump(healers, f, indent=2, ensure_ascii=False)
        logger.info(f"Imported {inserted_count} healers into healers.json")

    result = {"imported": inserted_count}
    if errors:
        result["errors"] = errors
    return result


# ── Photo Storage (base64 in DB) ─────────────────────────────────────────────

PHOTOS_FILE = ROOT_DIR / "photos.json"

def _load_photos() -> dict:
    """Load photos dict from local JSON file."""
    if PHOTOS_FILE.exists():
        with open(PHOTOS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def _save_photos(photos: dict):
    """Save photos dict to local JSON file."""
    with open(PHOTOS_FILE, "w", encoding="utf-8") as f:
        json.dump(photos, f, indent=2)


@api_router.post("/healers/{healer_id}/photo")
async def upload_healer_photo(healer_id: int, file: UploadFile = File(...)):
    """Upload a photo for a healer. Stores base64 in MongoDB and local JSON."""
    # Validate file type
    allowed = ("image/jpeg", "image/png", "image/webp", "image/gif")
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, WebP, or GIF)")

    # Read file contents
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5 MB limit
        raise HTTPException(status_code=400, detail="File size must be under 5 MB")

    # Encode to base64
    b64_data = base64.b64encode(contents).decode("utf-8")
    content_type = file.content_type or "image/jpeg"
    photo_doc = {"data": b64_data, "content_type": content_type}

    photo_url = f"/api/healers/{healer_id}/photo"
    logger.info(f"Photo uploaded for healer {healer_id} ({len(contents)} bytes)")

    # Store in MongoDB photos collection
    try:
        await db.photos.update_one(
            {"healer_id": healer_id},
            {"$set": {"healer_id": healer_id, **photo_doc}},
            upsert=True,
        )
        # Also update photo_url on the healer document
        await db.healers.update_one(
            {"id": healer_id},
            {"$set": {"photo_url": photo_url}}
        )
        logger.info(f"Photo stored in MongoDB for healer {healer_id}")
    except Exception as e:
        logger.warning(f"MongoDB unavailable for photo, using local JSON: {e}")

    # Always store in local JSON fallback too
    photos = _load_photos()
    photos[str(healer_id)] = photo_doc
    _save_photos(photos)

    # Update photo_url in healers.json
    if HEALERS_JSON.exists():
        with open(HEALERS_JSON, "r", encoding="utf-8") as f:
            healers = json.load(f)
        for h in healers:
            if h["id"] == healer_id:
                h["photo_url"] = photo_url
                break
        with open(HEALERS_JSON, "w", encoding="utf-8") as f:
            json.dump(healers, f, indent=2, ensure_ascii=False)

    return {"photo_url": photo_url}


@api_router.get("/healers/{healer_id}/photo")
async def get_healer_photo(healer_id: int):
    """Serve a healer's photo from MongoDB or local JSON fallback."""
    # Try MongoDB first
    try:
        doc = await db.photos.find_one({"healer_id": healer_id})
        if doc:
            img_bytes = base64.b64decode(doc["data"])
            return Response(content=img_bytes, media_type=doc.get("content_type", "image/jpeg"))
    except Exception as e:
        logger.warning(f"MongoDB unavailable for photo fetch: {e}")

    # Fallback to local JSON
    photos = _load_photos()
    photo = photos.get(str(healer_id))
    if photo:
        img_bytes = base64.b64decode(photo["data"])
        return Response(content=img_bytes, media_type=photo.get("content_type", "image/jpeg"))

    raise HTTPException(status_code=404, detail="Photo not found")

# ── Rating Routes (local JSON storage) ───────────────────────────────────────

@api_router.post("/healers/{healer_id}/rate", status_code=201)
async def rate_healer(healer_id: int, payload: RatingCreate):
    """Submit a rating for a healer. Stored locally in ratings.json."""
    ratings = _load_ratings()
    key = str(healer_id)

    if key not in ratings:
        ratings[key] = []

    ratings[key].append(payload.score)
    _save_ratings(ratings)

    scores = ratings[key]
    return {
        "healer_id": healer_id,
        "score": payload.score,
        "avg_rating": round(float(sum(scores)) / float(len(scores)), 1),
        "rating_count": len(scores),
    }


@api_router.get("/healers/{healer_id}/ratings", response_model=RatingAggregation)
async def get_healer_ratings(healer_id: int):
    """Return aggregate rating for a healer from local storage."""
    ratings = _load_ratings()
    scores = ratings.get(str(healer_id), [])
    if not scores:
        return {"average": 0, "count": 0}
    avg: float = sum(scores) / len(scores)
    return {"average": round(avg, 1), "count": len(scores)}


# ── Wire everything up ───────────────────────────────────────────────────────

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()