import React, { useState, useEffect } from 'react';
import { DailyDetailResponse, BlockDetail } from '../types/meteo';
import { API_BASE_URL } from '../config';
import { Sun, Cloud, CloudRain, Wind, Waves, Thermometer, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface DaySliderDetailProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DaySliderDetail: React.FC<DaySliderDetailProps> = ({
  dates,
  selectedDate,
  onSelectDate
}) => {
  const [detailData, setDetailData] = useState<DailyDetailResponse | null>(null);
  const [activeBlock, setActiveBlock] = useState<'Matin' | 'Après-midi' | 'Soir'>('Après-midi');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedDate) return;
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/v1/forecast/daily/${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setDetailData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch daily detail", err);
        setIsLoading(false);
      });
  }, [selectedDate]);

  const currentIndex = dates.indexOf(selectedDate);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectDate(dates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < dates.length - 1) {
      onSelectDate(dates[currentIndex + 1]);
    }
  };

  const currentBlockDetail: BlockDetail | undefined = detailData?.blocks[activeBlock];

  return (
    <div className="space-y-6">
      
      {/* Date Carousel Slider Header */}
      <div className="glass-card rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Jour Précédent
          </button>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {detailData?.day_label || selectedDate}
            </h2>
            <p className="text-xs text-sky-600 font-bold mt-0.5">
              Soustons-Plage (Littoral Océanique)
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === dates.length - 1}
            className="p-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
          >
            Jour Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Dates Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-thin">
          {dates.map((dStr) => {
            const isSelected = dStr === selectedDate;
            const dayNum = dStr.split('-')[2];
            return (
              <button
                key={dStr}
                onClick={() => onSelectDate(dStr)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-semibold'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">Août</div>
                <div className="text-base font-extrabold">{dayNum}</div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Time Block Selector Tabs */}
      <div className="flex items-center justify-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300 max-w-md mx-auto">
        {(['Matin', 'Après-midi', 'Soir'] as const).map((blockName) => (
          <button
            key={blockName}
            onClick={() => setActiveBlock(blockName)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              activeBlock === blockName
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            {blockName === 'Matin' ? '🌅 Matin (08-12h)' : blockName === 'Après-midi' ? '☀️ Après-midi (13-18h)' : '🌙 Soir (19-23h)'}
          </button>
        ))}
      </div>

      {/* Detail Metrics Grid */}
      {isLoading ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-bold">Chargement des données météo détaillées...</p>
        </div>
      ) : currentBlockDetail ? (
        <div className="space-y-6">

          {/* Main Score Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-100 border border-amber-300 rounded-2xl">
                <Sun className="w-10 h-10 text-amber-500 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Indice Vacances ({activeBlock})
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {currentBlockDetail.vacation_rating}
                </h3>
                <p className="text-xs text-sky-700 font-bold mt-1">
                  Modèle : {currentBlockDetail.source} • Confiance : {currentBlockDetail.confidence}
                </p>
              </div>
            </div>

            <div className="text-center md:text-right bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200">
              <div className="text-4xl font-extrabold text-amber-600">
                {currentBlockDetail.vacation_score} <span className="text-lg text-slate-500 font-bold">/ 10</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-bold">Note Soleil & Sécheresse</p>
            </div>
          </div>

          {/* Detailed Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

            {/* Temperature */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Température</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currentBlockDetail.temperature}°C</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Réelle à 2m</div>
            </div>

            {/* Apparent Temp */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">T° Ressentie</span>
                <Sparkles className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">{currentBlockDetail.apparent_temperature}°C</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Ressenti Plage</div>
            </div>

            {/* Cloud Cover */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Nuages</span>
                <Cloud className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currentBlockDetail.cloud_cover}%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Couverture du ciel</div>
            </div>

            {/* Precipitation */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Pluie</span>
                <CloudRain className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold text-blue-600">{currentBlockDetail.precipitation} mm</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Cumul pluie</div>
            </div>

            {/* Wind Speed */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Vent</span>
                <Wind className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currentBlockDetail.wind_speed} km/h</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Brise de mer</div>
            </div>

            {/* UV Index */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Indice UV</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">{currentBlockDetail.uv_index}</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Max solaire</div>
            </div>

            {/* Sea Temp */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Température Eau de Mer</span>
                <Waves className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold text-teal-700">{currentBlockDetail.sea_temperature}°C</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Baignade & Surf Soustons-Plage</div>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 font-semibold">
          Aucune donnée disponible pour ce créneau.
        </div>
      )}

    </div>
  );
};
