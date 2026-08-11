import urllib.request
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LOCATIONS = {
    'ville': {'name': 'Soustons Ville', 'lat': 43.75, 'lon': -1.33},
    'plage': {'name': 'Soustons-Plage / Océan', 'lat': 43.78, 'lon': -1.41}
}

MODELS = ['meteofrance_arome_france', 'ecmwf_ifs025', 'gfs_seamless']

def fetch_json(url):
    print(f"Fetching: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': 'MeteoScript/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def download_raw_data():
    # 1. Fetch Forecast API for each location and model
    for loc_key, loc_info in LOCATIONS.items():
        lat, lon = loc_info['lat'], loc_info['lon']
        
        # AROME
        url_arome = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&models=meteofrance_arome_france&hourly=temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,uv_index&timezone=Europe/Paris&forecast_days=16"
        data_arome = fetch_json(url_arome)
        if data_arome:
            with open(os.path.join(BASE_DIR, f"raw_{loc_key}_arome.json"), "w", encoding="utf-8") as f:
                json.dump(data_arome, f, indent=2)
                
        # ECMWF IFS
        url_ecmwf = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&models=ecmwf_ifs025&hourly=temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,uv_index&timezone=Europe/Paris&forecast_days=16"
        data_ecmwf = fetch_json(url_ecmwf)
        if data_ecmwf:
            with open(os.path.join(BASE_DIR, f"raw_{loc_key}_ecmwf.json"), "w", encoding="utf-8") as f:
                json.dump(data_ecmwf, f, indent=2)

        # GFS SEAMLESS
        url_gfs = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&models=gfs_seamless&hourly=temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,uv_index&timezone=Europe/Paris&forecast_days=16"
        data_gfs = fetch_json(url_gfs)
        if data_gfs:
            with open(os.path.join(BASE_DIR, f"raw_{loc_key}_gfs.json"), "w", encoding="utf-8") as f:
                json.dump(data_gfs, f, indent=2)

    # 2. Marine API for Soustons-Plage
    url_marine = f"https://marine-api.open-meteo.com/v1/marine?latitude=43.78&longitude=-1.41&hourly=sea_surface_temperature,wave_height&timezone=Europe/Paris&forecast_days=16"
    data_marine = fetch_json(url_marine)
    if data_marine:
        with open(os.path.join(BASE_DIR, "raw_plage_marine.json"), "w", encoding="utf-8") as f:
            json.dump(data_marine, f, indent=2)

    # 3. Ensemble API for Soustons Ville & Plage
    url_ens = f"https://ensemble-api.open-meteo.com/v1/ensemble?latitude=43.75&longitude=-1.33&models=ecmwf_ifs025,gfs025&hourly=temperature_2m,precipitation&timezone=Europe/Paris&forecast_days=16"
    data_ens = fetch_json(url_ens)
    if data_ens:
        with open(os.path.join(BASE_DIR, "raw_ensemble.json"), "w", encoding="utf-8") as f:
            json.dump(data_ens, f, indent=2)

    # 4. Historical Climatology for late August (2021-2025)
    climatology = {}
    for year in range(2021, 2026):
        url_hist = f"https://archive-api.open-meteo.com/v1/archive?latitude=43.75&longitude=-1.33&start_date={year}-08-16&end_date={year}-08-30&hourly=temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,uv_index&timezone=Europe/Paris"
        d_hist = fetch_json(url_hist)
        if d_hist:
            climatology[str(year)] = d_hist
    with open(os.path.join(BASE_DIR, "raw_climatology.json"), "w", encoding="utf-8") as f:
        json.dump(climatology, f, indent=2)

if __name__ == "__main__":
    download_raw_data()
    print("All raw weather data downloaded successfully.")
