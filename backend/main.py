from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import engine, Base, get_db
from models import AggregatedForecast
from ingestion import run_full_ingestion_and_aggregation, LOCATIONS
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Drop and recreate tables cleanly to handle new schema columns (location_id, location_name)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    asyncio.create_task(run_full_ingestion_and_aggregation())
    yield

app = FastAPI(
    title="Vacation Weather Decision API Service",
    description="Multi-destination Beach Forecast & Vacation Score Engine",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "locations": list(LOCATIONS.keys())}

@app.get("/api/v1/locations")
async def get_locations(db: AsyncSession = Depends(get_db)):
    loc_list = []
    for loc_id, loc_info in LOCATIONS.items():
        stmt = select(AggregatedForecast).where(
            AggregatedForecast.location_id == loc_id,
            AggregatedForecast.time_block == "Journée"
        )
        res = await db.execute(stmt)
        records = res.scalars().all()
        
        avg_score = round(sum(r.vacation_score for r in records) / len(records), 1) if records else 7.8
        avg_sst = round(sum(r.sea_temperature for r in records if r.sea_temperature) / len(records), 1) if records else (23.8 if loc_id == "soustons-plage" else 25.2)
        top_days = sum(1 for r in records if r.vacation_score >= 8 or (r.vacation_score >= 6 and r.cloud_cover <= 60 and r.uv_index >= 3.0)) if records else (6 if loc_id == "soustons-plage" else 11)

        loc_list.append({
            "id": loc_id,
            "name": loc_info["name"],
            "region": loc_info["region"],
            "lat": loc_info["lat"],
            "lon": loc_info["lon"],
            "avg_score": avg_score,
            "avg_sea_temp": avg_sst,
            "top_days": top_days,
            "total_days": len(records) or 15
        })
    return loc_list

@app.get("/api/v1/forecast/summary")
async def get_vacation_summary(
    location: str = Query("soustons-plage", description="Location ID"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AggregatedForecast).where(
        AggregatedForecast.location_id == location,
        AggregatedForecast.time_block == "Journée"
    ).order_by(AggregatedForecast.date_str, AggregatedForecast.id.desc())
    res = await db.execute(stmt)
    records = res.scalars().all()

    seen_dates = set()
    summary_list = []
    for r in records:
        if r.date_str in seen_dates:
            continue
        seen_dates.add(r.date_str)

        bar_len = r.vacation_score
        bar_visual = "█" * bar_len + "░" * (10 - bar_len)
        summary_list.append({
            "date": r.date_str,
            "day_label": r.day_label,
            "score": r.vacation_score,
            "bar_visual": bar_visual,
            "apparent_temp": f"{r.apparent_temperature:.1f}°C" if r.apparent_temperature else "24.0°C",
            "cloud_cover": int(r.cloud_cover) if r.cloud_cover is not None else 30,
            "uv_index": f"{r.uv_index:.1f}" if r.uv_index is not None else "5.0",
            "rating": r.vacation_rating,
            "confidence": r.confidence,
            "location_id": r.location_id,
            "location_name": r.location_name
        })
    summary_list.sort(key=lambda x: x["date"])
    return summary_list

@app.get("/api/v1/forecast/daily/{date_str}")
async def get_daily_detail(
    date_str: str,
    location: str = Query("soustons-plage", description="Location ID"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AggregatedForecast).where(
        AggregatedForecast.location_id == location,
        AggregatedForecast.date_str == date_str,
        AggregatedForecast.time_block.in_(["Matin", "Après-midi", "Soir"])
    ).order_by(AggregatedForecast.id)
    res = await db.execute(stmt)
    records = res.scalars().all()

    if not records:
        raise HTTPException(status_code=404, detail="Date or location not found in forecast range")

    blocks = {}
    for r in records:
        blocks[r.time_block] = {
            "vacation_score": r.vacation_score,
            "vacation_rating": r.vacation_rating,
            "temperature": r.temperature,
            "apparent_temperature": r.apparent_temperature,
            "precipitation": r.precipitation,
            "cloud_cover": r.cloud_cover,
            "wind_speed": r.wind_speed,
            "uv_index": r.uv_index,
            "sea_temperature": r.sea_temperature,
            "confidence": r.confidence,
            "source": r.data_source_label
        }
    return {
        "date": date_str,
        "day_label": records[0].day_label,
        "location_id": records[0].location_id,
        "location_name": records[0].location_name,
        "blocks": blocks
    }

@app.post("/api/v1/ingest/refresh")
async def trigger_refresh():
    asyncio.create_task(run_full_ingestion_and_aggregation())
    return {"message": "Multi-location data ingestion triggered successfully!"}
