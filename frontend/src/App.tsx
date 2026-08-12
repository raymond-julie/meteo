import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeSearchLanding } from './components/HomeSearchLanding';
import { VacationOverview } from './components/VacationOverview';
import { DaySliderDetail } from './components/DaySliderDetail';
import { VacationSummaryItem, LocationInfo } from './types/meteo';
import { API_BASE_URL } from './config';
import { Globe, Github, Linkedin, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'slider'>('home');
  const [locations, setLocations] = useState<LocationInfo[]>([
    {
      id: "soustons-plage",
      name: "Soustons-Plage",
      region: "Littoral Atlantique • Landes",
      lat: 43.78,
      lon: -1.41,
      avg_score: 7.8,
      avg_sea_temp: 23.8,
      top_days: 6,
      total_days: 15
    },
    {
      id: "canet-plage",
      name: "Canet-en-Roussillon-Plage",
      region: "Littoral Méditerranéen • Pyrénées-Orientales",
      lat: 42.69,
      lon: 3.01,
      avg_score: 7.8,
      avg_sea_temp: 25.2,
      top_days: 11,
      total_days: 15
    }
  ]);
  const [selectedLocation, setSelectedLocation] = useState<string>('soustons-plage');
  const [summaryData, setSummaryData] = useState<VacationSummaryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-16');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/locations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch locations list", err);
    }
  };

  const fetchSummary = async (locId: string = selectedLocation) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/forecast/summary?location=${locId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSummaryData(data);
        setIsLoading(false);
        setErrorMsg(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch summary data", err);
      setErrorMsg(err.message || "Erreur de connexion API");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchSummary(selectedLocation);
    const interval = setInterval(() => {
      fetchSummary(selectedLocation);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleSelectLocation = (locId: string) => {
    setSelectedLocation(locId);
    setIsLoading(true);
    fetchSummary(locId);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch(`${API_BASE_URL}/api/v1/ingest/refresh`, { method: 'POST' })
      .then(() => {
        setTimeout(() => {
          fetchLocations();
          fetchSummary(selectedLocation);
          setIsRefreshing(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to refresh ingestion", err);
        setIsRefreshing(false);
      });
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('slider');
  };

  const datesList = summaryData.map((s) => s.date);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-12">
        {isLoading && summaryData.length === 0 && activeTab !== 'home' ? (
          <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl border border-slate-200 shadow-sm">
            <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full mb-4" />
            <p className="text-base font-bold text-slate-800">Synchronisation Multi-Destinations en cours...</p>
            <p className="text-xs text-slate-500 mt-1">Ingestion Open-Meteo ECMWF, GFS, ICON & Météo-France</p>
          </div>
        ) : (
          <>
            {errorMsg && summaryData.length === 0 && activeTab !== 'home' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-center text-sm font-semibold">
                ⚠️ {errorMsg} - Nouvelle tentative en cours...
              </div>
            )}

            {activeTab === 'home' && (
              <HomeSearchLanding
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                onNavigateToOverview={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'overview' && (
              <VacationOverview
                summary={summaryData}
                onSelectDay={handleSelectDay}
                selectedLocation={selectedLocation}
                locations={locations}
              />
            )}

            {activeTab === 'slider' && (
              <DaySliderDetail
                dates={datesList.length > 0 ? datesList : ['2026-08-16']}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedLocation={selectedLocation}
                locations={locations}
              />
            )}
          </>
        )}
      </main>

      {/* Author & Links Footer */}
      <footer className="glass-card border-t border-slate-200 py-8 px-4 text-xs text-slate-600 bg-white/90 backdrop-blur-md shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* App Info */}
          <div className="text-center md:text-left space-y-1">
            <p className="font-extrabold text-slate-900 text-sm tracking-tight">
              Vacances Météo Plage 2.0 • Comparateur & Decision Engine
            </p>
            <p className="text-slate-500 font-medium text-xs">
              Prévisions Multi-Modèles ECMWF IFS, GFS, ICON, Météo-France & Copernicus Marine SST
            </p>
          </div>

          {/* Author Badge & Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              Conçu avec <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> par{' '}
              <span className="bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent font-black">
                Julie Raymond
              </span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="https://julie-raymond-dev.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 font-bold rounded-xl border border-slate-200 transition-all shadow-sm text-xs group"
              >
                <Globe className="w-3.5 h-3.5 text-sky-500 group-hover:text-white" /> Portfolio
              </a>

              <a
                href="https://github.com/raymond-julie"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold rounded-xl border border-slate-200 transition-all shadow-sm text-xs group"
              >
                <Github className="w-3.5 h-3.5 text-slate-700 group-hover:text-white" /> GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/raymond-julie/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded-xl border border-slate-200 transition-all shadow-sm text-xs group"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" /> LinkedIn
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default App;
