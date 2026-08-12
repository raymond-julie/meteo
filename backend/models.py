from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    date_str = Column(String, index=True) # e.g. "2026-08-16"
    hour = Column(Integer)
    model_source = Column(String, index=True) # e.g. "ecmwf", "gfs", "icon", "meteofrance"
    location_id = Column(String, index=True, default="soustons-plage")
    location_name = Column(String, default="Soustons-Plage")
    
    temperature = Column(Float, nullable=True)
    apparent_temperature = Column(Float, nullable=True)
    precipitation = Column(Float, nullable=True)
    cloud_cover = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    uv_index = Column(Float, nullable=True)
    sea_surface_temperature = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AggregatedForecast(Base):
    __tablename__ = "aggregated_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(String, index=True, default="soustons-plage")
    location_name = Column(String, default="Soustons-Plage")
    date_str = Column(String, index=True)
    day_label = Column(String)
    time_block = Column(String, index=True) # "Matin", "Après-midi", "Soir", "Journée"
    
    vacation_score = Column(Integer) # 1 to 10
    vacation_rating = Column(String) # e.g. "Grand Soleil (Idéal)"
    
    temperature = Column(Float, nullable=True)
    apparent_temperature = Column(Float, nullable=True)
    precipitation = Column(Float, nullable=True)
    cloud_cover = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    uv_index = Column(Float, nullable=True)
    sea_temperature = Column(Float, nullable=True)
    
    confidence = Column(String)
    data_source_label = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
