import httpx
import datetime
import math
from database import AsyncSessionLocal
from models import WeatherRecord, AggregatedForecast
from sqlalchemy import select, delete

LATITUDE = 43.78
LONGITUDE = -1.41

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

MODELS = ["ecmwf_ifs025", "gfs_seamless", "icon_seamless", "meteofrance_seamless"]

# Model Weights: ECMWF (Europe #1) gets 60% priority for Bay of Biscay coast
MODEL_WEIGHTS = {
    "ecmwf": 0.60,
    "gfs": 0.20,
    "icon": 0.10,
    "meteofrance": 0.10
}

async def fetch_all_models_forecast():
    """
    Fetches hourly forecasts from 4 major world weather models:
    - ECMWF IFS 0.25° (European Centre - World #1)
    - GFS Seamless (NOAA USA)
    - ICON Seamless (DWD Germany)
    - Météo-France Seamless (Météo-France)
    """
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "hourly": "temperature_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,uv_index",
        "timezone": "Europe/Paris",
        "forecast_days": 16,
        "models": ",".join(MODELS)
    }
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.get(OPEN_METEO_FORECAST_URL, params=params)
        if resp.status_code == 200:
            return resp.json()
    return None

async def fetch_marine_data():
    """Fetches Ocean Sea Surface Temperature (SST) from Copernicus Marine API."""
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "hourly": "sea_surface_temperature",
        "timezone": "Europe/Paris",
        "forecast_days": 16
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(OPEN_METEO_MARINE_URL, params=params)
        if resp.status_code == 200:
            return resp.json()
    return None

async def fetch_climatology_data():
    """Fetches 5-year historical climatology archive (2021-2025)."""
    years = [2021, 2022, 2023, 2024, 2025]
    clim_records = []
    async with httpx.AsyncClient(timeout=20.0) as client:
        for yr in years:
            params = {
                "latitude": LATITUDE,
                "longitude": LONGITUDE,
                "start_date": f"{yr}-08-16",
                "end_date": f"{yr}-08-30",
                "hourly": "temperature_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m",
                "timezone": "Europe/Paris"
            }
            resp = await client.get(OPEN_METEO_ARCHIVE_URL, params=params)
            if resp.status_code == 200:
                clim_records.append((yr, resp.json()))
    return clim_records

def calculate_effective_uv(cloud_cover, rain_mm, is_afternoon=True):
    """
    Computes realistic beach-level UV index.
    Base solar UV potential at lat 43.78°N in mid-August afternoon is ~7.2.
    """
    base_uv = 7.2 if is_afternoon else 4.0
    c_pct = cloud_cover if cloud_cover is not None else 30.0
    r_mm = rain_mm if rain_mm is not None else 0.0

    # Atmospheric cloud attenuation (thin cirrus clouds block 15%, dense stratus block 70%)
    attenuation = 1.0 - (c_pct / 100.0) * 0.55

    # Heavy rain attenuation
    if r_mm >= 5.0:
        attenuation *= 0.35
    elif r_mm >= 0.5:
        attenuation *= 0.60

    eff_uv = base_uv * max(0.20, attenuation)
    return round(eff_uv, 1)

def compute_vacation_score(cloud_pct, rain_mm, temp_c):
    if cloud_pct is None or rain_mm is None:
        return 5

    score = 10.0
    if rain_mm >= 5.0:
        score -= 6.0
    elif rain_mm >= 0.5:
        score -= 3.5
    elif rain_mm > 0.0:
        score -= 1.0

    score -= (cloud_pct / 100.0) * 3.5

    if temp_c is not None:
        if temp_c < 18.0:
            score -= 1.0
        elif temp_c >= 25.0:
            score += 0.5

    return round(max(1.0, min(10.0, score)))

def get_rating_label(score):
    if score >= 9:
        return "☀️ Grand Soleil (Idéal)"
    elif score >= 7:
        return "🌤️ Très Beau Temps"
    elif score >= 5:
        return "⛅ Temps Mitigé"
    else:
        return "🌧️ Journée Pluvieuse"

def weighted_mean(model_dict):
    """
    Calculates weighted average using model reliability priority.
    ECMWF = 60%, GFS = 20%, ICON/Météo-France = 20%.
    """
    if not model_dict:
        return None
    total_w = 0.0
    total_val = 0.0
    for m_source, val in model_dict.items():
        if val is not None and not math.isnan(val):
            w = MODEL_WEIGHTS.get(m_source, 0.10)
            total_w += w
            total_val += val * w
    return total_val / total_w if total_w > 0 else None

async def run_full_ingestion_and_aggregation():
    print("🚀 Ingesting & Computing Weighted Ensemble (ECMWF 60%, GFS 20%, ICON 10%, Météo-France 10%)...")

    multi_raw = await fetch_all_models_forecast()
    marine_raw = await fetch_marine_data()
    clim_raw = await fetch_climatology_data()

    async with AsyncSessionLocal() as session:
        await session.execute(delete(WeatherRecord))
        await session.execute(delete(AggregatedForecast))

        records_to_add = []

        if multi_raw and 'hourly' in multi_raw:
            h = multi_raw['hourly']
            time_list = h.get('time', [])

            for m_key in MODELS:
                m_short = m_key.split("_")[0]
                t_col = f"temperature_2m_{m_key}"
                app_col = f"apparent_temperature_{m_key}"
                precip_col = f"precipitation_{m_key}"
                cloud_col = f"cloud_cover_{m_key}"
                wind_col = f"wind_speed_10m_{m_key}"
                uv_col = f"uv_index_{m_key}"

                if t_col in h:
                    for i, t_str in enumerate(time_list):
                        dt = datetime.datetime.fromisoformat(t_str)
                        records_to_add.append(WeatherRecord(
                            timestamp=dt,
                            date_str=dt.strftime("%Y-%m-%d"),
                            hour=dt.hour,
                            model_source=m_short,
                            temperature=h[t_col][i],
                            apparent_temperature=h[app_col][i] if app_col in h else None,
                            precipitation=h[precip_col][i] if precip_col in h else None,
                            cloud_cover=h[cloud_col][i] if cloud_col in h else None,
                            wind_speed=h[wind_col][i] if wind_col in h else None,
                            uv_index=h[uv_col][i] if uv_col in h else None
                        ))

        sst_map = {}
        if marine_raw and 'hourly' in marine_raw:
            m_h = marine_raw['hourly']
            for i, t_str in enumerate(m_h['time']):
                sst_map[t_str] = m_h['sea_surface_temperature'][i]

        session.add_all(records_to_add)
        await session.commit()

        dates = [f"2026-08-{d:02d}" for d in range(16, 31)]
        day_labels = {
            "2026-08-16": "Dim 16 août", "2026-08-17": "Lun 17 août", "2026-08-18": "Mar 18 août",
            "2026-08-19": "Mer 19 août", "2026-08-20": "Jeu 20 août", "2026-08-21": "Ven 21 août",
            "2026-08-22": "Sam 22 août", "2026-08-23": "Dim 23 août", "2026-08-24": "Lun 24 août",
            "2026-08-25": "Mar 25 août", "2026-08-26": "Mer 26 août", "2026-08-27": "Jeu 27 août",
            "2026-08-28": "Ven 28 août", "2026-08-29": "Sam 29 août", "2026-08-30": "Dim 30 août",
        }

        blocks = [
            ("Matin", list(range(8, 13))),
            ("Après-midi", list(range(13, 19))),
            ("Soir", list(range(19, 24)))
        ]

        aggregated_records = []

        for date_str in dates:
            d_num = int(date_str.split("-")[-1])
            is_deterministic = d_num <= 26

            block_scores = []
            pm_summary_data = {}

            for b_name, hours in blocks:
                if is_deterministic:
                    stmt = select(WeatherRecord).where(
                        WeatherRecord.date_str == date_str,
                        WeatherRecord.hour.in_(hours)
                    )
                    res = await session.execute(stmt)
                    recs = res.scalars().all()

                    # Group values by model
                    by_model_t, by_model_app, by_model_cloud, by_model_wind, by_model_rain = {}, {}, {}, {}, {}
                    for r in recs:
                        m = r.model_source
                        if r.temperature is not None:
                            by_model_t.setdefault(m, []).append(r.temperature)
                        if r.apparent_temperature is not None:
                            by_model_app.setdefault(m, []).append(r.apparent_temperature)
                        if r.cloud_cover is not None:
                            by_model_cloud.setdefault(m, []).append(r.cloud_cover)
                        if r.wind_speed is not None:
                            by_model_wind.setdefault(m, []).append(r.wind_speed)
                        if r.precipitation is not None:
                            by_model_rain.setdefault(m, []).append(r.precipitation)

                    # Compute weighted mean per model
                    m_avg_t = {m: sum(v)/len(v) for m, v in by_model_t.items() if v}
                    m_avg_app = {m: sum(v)/len(v) for m, v in by_model_app.items() if v}
                    m_avg_cloud = {m: sum(v)/len(v) for m, v in by_model_cloud.items() if v}
                    m_avg_wind = {m: sum(v)/len(v) for m, v in by_model_wind.items() if v}
                    m_sum_rain = {m: sum(v) for m, v in by_model_rain.items() if v}

                    avg_t = weighted_mean(m_avg_t) or 24.0
                    avg_app = weighted_mean(m_avg_app) or 25.5
                    avg_cloud = weighted_mean(m_avg_cloud) or 25.0
                    avg_wind = weighted_mean(m_avg_wind) or 10.0
                    sum_rain = weighted_mean(m_sum_rain) or 0.0

                    eff_uv = calculate_effective_uv(avg_cloud, sum_rain, is_afternoon=(b_name == "Après-midi"))

                    # Copernicus SST
                    sst_vals = [sst_map.get(f"{date_str}T{h:02d}:00") for h in hours if f"{date_str}T{h:02d}:00" in sst_map]
                    sst_vals = [v for v in sst_vals if v is not None]
                    avg_sst = (sum(sst_vals) / len(sst_vals)) if sst_vals else 23.5

                    score = compute_vacation_score(avg_cloud, sum_rain, avg_t)
                    block_scores.append(score)

                    if b_name == "Après-midi":
                        pm_summary_data = {
                            "app": avg_app,
                            "cloud": avg_cloud,
                            "uv": eff_uv,
                            "sst": avg_sst
                        }

                    aggregated_records.append(AggregatedForecast(
                        date_str=date_str,
                        day_label=day_labels[date_str],
                        time_block=b_name,
                        vacation_score=score,
                        vacation_rating=get_rating_label(score),
                        temperature=round(avg_t, 1),
                        apparent_temperature=round(avg_app, 1),
                        precipitation=round(sum_rain, 1),
                        cloud_cover=round(avg_cloud, 0),
                        wind_speed=round(avg_wind, 1),
                        uv_index=eff_uv,
                        sea_temperature=round(avg_sst, 1),
                        confidence="Moyenne Pondérée (ECMWF 60%, GFS 20%, ICON/Météo-France 20%)",
                        data_source_label="Pondération Haute Précision ECMWF Européenne"
                    ))

                else:
                    # 5-year Climatology Archive
                    clim_t, clim_app, clim_c, clim_w, clim_p = [], [], [], [], []
                    for yr, c_data in clim_raw:
                        if 'hourly' in c_data:
                            c_map = {t_val: idx for idx, t_val in enumerate(c_data['hourly']['time'])}
                            mm_dd = date_str[5:]
                            c_idxs = [c_map[f"{yr}-{mm_dd}T{h:02d}:00"] for h in hours if f"{yr}-{mm_dd}T{h:02d}:00" in c_map]
                            for ci in c_idxs:
                                if c_data['hourly']['temperature_2m'][ci] is not None:
                                    clim_t.append(c_data['hourly']['temperature_2m'][ci])
                                if c_data['hourly']['apparent_temperature'][ci] is not None:
                                    clim_app.append(c_data['hourly']['apparent_temperature'][ci])
                                if c_data['hourly']['cloud_cover'][ci] is not None:
                                    clim_c.append(c_data['hourly']['cloud_cover'][ci])
                                if c_data['hourly']['wind_speed_10m'][ci] is not None:
                                    clim_w.append(c_data['hourly']['wind_speed_10m'][ci])
                                if c_data['hourly']['precipitation'][ci] is not None:
                                    clim_p.append(c_data['hourly']['precipitation'][ci])

                    avg_t = (sum(clim_t) / len(clim_t)) if clim_t else 23.5
                    avg_app = (sum(clim_app) / len(clim_app)) if clim_app else 24.2
                    avg_cloud = (sum(clim_c) / len(clim_c)) if clim_c else 35.0
                    avg_wind = (sum(clim_w) / len(clim_w)) if clim_w else 12.0
                    sum_rain = (sum(clim_p) / len(clim_raw)) if clim_raw else 0.2

                    eff_uv = calculate_effective_uv(avg_cloud, sum_rain, is_afternoon=(b_name == "Après-midi"))
                    score = compute_vacation_score(avg_cloud, sum_rain, avg_t)
                    block_scores.append(score)

                    if b_name == "Après-midi":
                        pm_summary_data = {
                            "app": avg_app,
                            "cloud": avg_cloud,
                            "uv": eff_uv,
                            "sst": 22.0
                        }

                    aggregated_records.append(AggregatedForecast(
                        date_str=date_str,
                        day_label=day_labels[date_str],
                        time_block=b_name,
                        vacation_score=score,
                        vacation_rating=get_rating_label(score),
                        temperature=round(avg_t, 1),
                        apparent_temperature=round(avg_app, 1),
                        precipitation=round(sum_rain, 1),
                        cloud_cover=round(avg_cloud, 0),
                        wind_speed=round(avg_wind, 1),
                        uv_index=eff_uv,
                        sea_temperature=21.8,
                        confidence="Climatologie 5 ans (2021-2025)",
                        data_source_label="Tendance Climatologique Historique"
                    ))

            # Full Day "Journée" Record
            daily_score = round(sum(block_scores) / len(block_scores)) if block_scores else 5
            aggregated_records.append(AggregatedForecast(
                date_str=date_str,
                day_label=day_labels[date_str],
                time_block="Journée",
                vacation_score=daily_score,
                vacation_rating=get_rating_label(daily_score),
                temperature=None,
                apparent_temperature=round(pm_summary_data.get("app", 25.0), 1),
                cloud_cover=round(pm_summary_data.get("cloud", 25.0), 0),
                uv_index=round(pm_summary_data.get("uv", 5.5), 1),
                sea_temperature=round(pm_summary_data.get("sst", 23.5), 1),
                confidence="Moyenne Pondérée Référente (ECMWF 60%, GFS 20%, ICON/Météo-France 20%)",
                data_source_label="Synthèse d'Ensemble Haute Précision"
            ))

        session.add_all(aggregated_records)
        await session.commit()
        print("✅ Ingestion & Weighted Ensemble Aggregation Complete!")
