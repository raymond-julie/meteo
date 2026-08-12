export interface VacationSummaryItem {
  date: string;
  day_label: string;
  score: number;
  bar_visual: string;
  apparent_temp: string;
  cloud_cover: number;
  uv_index: string;
  rating: string;
  confidence: string;
  location_id?: string;
  location_name?: string;
}

export interface BlockDetail {
  vacation_score: number;
  vacation_rating: string;
  temperature: number;
  apparent_temperature: number;
  precipitation: number;
  cloud_cover: number;
  wind_speed: number;
  uv_index: number;
  sea_temperature: number;
  confidence: string;
  source: string;
}

export interface DailyDetailResponse {
  date: string;
  day_label: string;
  location_id?: string;
  location_name?: string;
  blocks: {
    "Matin"?: BlockDetail;
    "Après-midi"?: BlockDetail;
    "Soir"?: BlockDetail;
  };
}

export interface LocationInfo {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  avg_score: number;
  avg_sea_temp: number;
  top_days: number;
  total_days: number;
}
