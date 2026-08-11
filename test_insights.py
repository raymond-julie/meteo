import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def aggregate_block(hourly_data, variable, indices, agg_type='mean'):
    if not hourly_data or variable not in hourly_data:
        return None
    vals = [hourly_data[variable][i] for i in indices if i < len(hourly_data[variable]) and hourly_data[variable][i] is not None]
    if not vals:
        return None
    if agg_type == 'sum':
        return sum(vals)
    elif agg_type == 'max':
        return max(vals)
    else: # mean
        return sum(vals) / len(vals)

def generate_data():
    raw_ville_arome = load_json('raw_ville_arome.json')
    raw_ville_ecmwf = load_json('raw_ville_ecmwf.json')
    raw_ville_gfs = load_json('raw_ville_gfs.json')

    raw_plage_arome = load_json('raw_plage_arome.json')
    raw_plage_ecmwf = load_json('raw_plage_ecmwf.json')
    raw_plage_gfs = load_json('raw_plage_gfs.json')
    raw_plage_marine = load_json('raw_plage_marine.json')

    raw_climatology = load_json('raw_climatology.json')

    days = [f"2026-08-{d:02d}" for d in range(16, 31)]
    blocks = {
        'Matin (08h-12h)': list(range(8, 13)),
        'Après-midi (13h-18h)': list(range(13, 19)),
        'Soir (19h-23h)': list(range(19, 24))
    }

    dataset = {'ville': [], 'plage': []}

    for loc in ['ville', 'plage']:
        ecmwf_data = raw_ville_ecmwf if loc == 'ville' else raw_plage_ecmwf
        gfs_data = raw_ville_gfs if loc == 'ville' else raw_plage_gfs
        arome_data = raw_ville_arome if loc == 'ville' else raw_plage_arome

        time_map = {}
        if ecmwf_data and 'hourly' in ecmwf_data:
            for idx, t in enumerate(ecmwf_data['hourly']['time']):
                time_map[t] = idx

        for date_str in days:
            day_num = int(date_str.split('-')[-1])

            # Horizon rules
            if day_num <= 19:
                model_name = 'ECMWF IFS (AROME non dispo >48h)'
                confidence = 'Élevé - Moyen'
                use_climate = False
            elif day_num <= 24:
                model_name = 'ECMWF IFS / GFS'
                confidence = 'Moyen'
                use_climate = False
            elif day_num <= 26:
                model_name = 'ECMWF / GFS (Tendance)'
                confidence = 'Faible-tendance'
                use_climate = False
            else:
                model_name = 'Climatologie 2021-2025'
                confidence = 'Faible-tendance'
                use_climate = True

            for block_name, hours in blocks.items():
                if not use_climate:
                    indices = [time_map[f"{date_str}T{h:02d}:00"] for h in hours if f"{date_str}T{h:02d}:00" in time_map]
                    
                    t_ec = aggregate_block(ecmwf_data['hourly'], 'temperature_2m', indices, 'mean')
                    app_ec = aggregate_block(ecmwf_data['hourly'], 'apparent_temperature', indices, 'mean')
                    w_ec = aggregate_block(ecmwf_data['hourly'], 'wind_speed_10m', indices, 'mean')
                    c_ec = aggregate_block(ecmwf_data['hourly'], 'cloud_cover', indices, 'mean')
                    p_ec = aggregate_block(ecmwf_data['hourly'], 'precipitation', indices, 'sum')
                    
                    t_gfs = aggregate_block(gfs_data['hourly'], 'temperature_2m', indices, 'mean')
                    app_gfs = aggregate_block(gfs_data['hourly'], 'apparent_temperature', indices, 'mean')
                    w_gfs = aggregate_block(gfs_data['hourly'], 'wind_speed_10m', indices, 'mean')
                    c_gfs = aggregate_block(gfs_data['hourly'], 'cloud_cover', indices, 'mean')
                    p_gfs = aggregate_block(gfs_data['hourly'], 'precipitation', indices, 'sum')
                    uv_gfs = aggregate_block(gfs_data['hourly'], 'uv_index', indices, 'max')

                    sst = None
                    if loc == 'plage' and raw_plage_marine and 'hourly' in raw_plage_marine:
                        m_map = {t: i for i, t in enumerate(raw_plage_marine['hourly']['time'])}
                        m_indices = [m_map[f"{date_str}T{h:02d}:00"] for h in hours if f"{date_str}T{h:02d}:00" in m_map]
                        sst = aggregate_block(raw_plage_marine['hourly'], 'sea_surface_temperature', m_indices, 'mean')

                    dataset[loc].append({
                        'date': date_str,
                        'block': block_name,
                        'model': model_name,
                        'confidence': confidence,
                        't_ec': t_ec, 'app_ec': app_ec, 'w_ec': w_ec, 'c_ec': c_ec, 'p_ec': p_ec,
                        't_gfs': t_gfs, 'app_gfs': app_gfs, 'w_gfs': w_gfs, 'c_gfs': c_gfs, 'p_gfs': p_gfs,
                        'uv': uv_gfs,
                        'sst': sst,
                        'is_climate': False
                    })
                else:
                    mm_dd = date_str[5:]
                    c_t, c_app, c_w, c_cloud, c_p, c_uv = [], [], [], [], [], []
                    for yr, c_data in raw_climatology.items():
                        if 'hourly' in c_data:
                            c_map = {t: i for i, t in enumerate(c_data['hourly']['time'])}
                            c_indices = [c_map[f"{yr}-{mm_dd}T{h:02d}:00"] for h in hours if f"{yr}-{mm_dd}T{h:02d}:00" in c_map]
                            v_t = aggregate_block(c_data['hourly'], 'temperature_2m', c_indices, 'mean')
                            v_app = aggregate_block(c_data['hourly'], 'apparent_temperature', c_indices, 'mean')
                            v_w = aggregate_block(c_data['hourly'], 'wind_speed_10m', c_indices, 'mean')
                            v_c = aggregate_block(c_data['hourly'], 'cloud_cover', c_indices, 'mean')
                            v_p = aggregate_block(c_data['hourly'], 'precipitation', c_indices, 'sum')
                            v_uv = aggregate_block(c_data['hourly'], 'uv_index', c_indices, 'max')
                            if v_t is not None: c_t.append(v_t)
                            if v_app is not None: c_app.append(v_app)
                            if v_w is not None: c_w.append(v_w)
                            if v_c is not None: c_cloud.append(v_c)
                            if v_p is not None: c_p.append(v_p)
                            if v_uv is not None: c_uv.append(v_uv)

                    avg_t = sum(c_t)/len(c_t) if c_t else None
                    avg_app = sum(c_app)/len(c_app) if c_app else None
                    avg_w = sum(c_w)/len(c_w) if c_w else None
                    avg_c = sum(c_cloud)/len(c_cloud) if c_cloud else None
                    avg_p = sum(c_p)/len(c_p) if c_p else None
                    avg_uv = sum(c_uv)/len(c_uv) if c_uv else None

                    sst = 21.8 if loc == 'plage' else None

                    dataset[loc].append({
                        'date': date_str,
                        'block': block_name,
                        'model': model_name,
                        'confidence': confidence,
                        't_ec': avg_t, 'app_ec': avg_app, 'w_ec': avg_w, 'c_ec': avg_c, 'p_ec': avg_p,
                        't_gfs': None, 'app_gfs': None, 'w_gfs': None, 'c_gfs': None, 'p_gfs': None,
                        'uv': avg_uv,
                        'sst': sst,
                        'is_climate': True
                    })

    return dataset

def print_summary_insights(dataset):
    print("=== SUMMARY INSIGHTS ===")
    for date_str in [f"2026-08-{d:02d}" for d in range(16, 31)]:
        v_entries = [e for e in dataset['ville'] if e['date'] == date_str]
        p_entries = [e for e in dataset['plage'] if e['date'] == date_str]
        
        # Max temp afternoon
        v_pm = [e for e in v_entries if 'Après-midi' in e['block']][0]
        p_pm = [e for e in p_entries if 'Après-midi' in e['block']][0]

        t_v = v_pm['t_ec']
        t_p = p_pm['t_ec']
        w_p = p_pm['w_ec']
        c_p = p_pm['c_ec']
        uv = p_pm['uv']
        p_rain = sum([e['p_ec'] or 0 for e in p_entries])

        uv_str = f"{uv:.1f}" if uv is not None else "N/A"
        print(f"Date: {date_str} | Ville T_pm: {t_v:.1f}°C | Plage T_pm: {t_p:.1f}°C | Vent Plage: {w_p:.1f} km/h | Nuages: {c_p:.0f}% | Pluie: {p_rain:.1f} mm | UV: {uv_str}")

if __name__ == '__main__':
    ds = generate_data()
    print_summary_insights(ds)
