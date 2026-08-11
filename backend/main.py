from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import engine, Base, get_db
from models import AggregatedForecast, WeatherRecord
from ingestion import run_full_ingestion_and_aggregation
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run initial ingestion task
    asyncio.create_task(run_full_ingestion_and_aggregation())
    yield

app = FastAPI(
    title="Soustons-Plage Weather API Service",
    description="Multi-provider Weather Forecast & Vacation Score Service",
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

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "location": "Soustons-Plage", "coordinates": {"lat": 43.78, "lon": -1.41}}

@app.get("/api/v1/forecast/summary")
async def get_vacation_summary(db: AsyncSession = Depends(get_db)):
    stmt = select(AggregatedForecast).where(AggregatedForecast.time_block == "Journée").order_by(AggregatedForecast.date_str)
    res = await db.execute(stmt)
    records = res.scalars().all()

    summary_list = []
    for r in records:
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
            "confidence": r.confidence
        })
    return summary_list

@app.get("/api/v1/forecast/daily/{date_str}")
async def get_daily_detail(date_str: str, db: AsyncSession = Depends(get_db)):
    stmt = select(AggregatedForecast).where(
        AggregatedForecast.date_str == date_str,
        AggregatedForecast.time_block.in_(["Matin", "Après-midi", "Soir"])
    ).order_by(AggregatedForecast.id)
    res = await db.execute(stmt)
    records = res.scalars().all()

    if not records:
        raise HTTPException(status_code=44, detail="Date not found in forecast range")

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
        "blocks": blocks
    }

@app.post("/api/v1/ingest/refresh")
async def trigger_refresh():
    asyncio.create_task(run_full_ingestion_and_aggregation())
    return {"message": "Data ingestion and ensemble re-aggregation triggered successfully!"}
