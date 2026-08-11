import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VacationOverview } from './components/VacationOverview';
import { DaySliderDetail } from './components/DaySliderDetail';
import { VacationSummaryItem } from './types/meteo';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'slider'>('overview');
  const [summaryData, setSummaryData] = useState<VacationSummaryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-16');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/v1/forecast/summary');
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
    fetchSummary();
    const interval = setInterval(() => {
      fetchSummary();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch('/api/v1/ingest/refresh', { method: 'POST' })
      .then(() => {
        setTimeout(() => {
          fetchSummary();
          setIsRefreshing(false);
        }, 1500);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-12">
        {isLoading && summaryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl border border-slate-800">
            <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full mb-4" />
            <p className="text-base font-semibold text-slate-300">Synchronisation des API Météo en cours...</p>
            <p className="text-xs text-slate-500 mt-1">Ingestion Open-Meteo ECMWF, GFS & Climatologie 5 ans</p>
          </div>
        ) : (
          <>
            {errorMsg && summaryData.length === 0 && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-4 text-center text-sm font-semibold">
                ⚠️ {errorMsg} - Nouvelle tentative en cours...
              </div>
            )}
            {activeTab === 'overview' && (
              <VacationOverview
                summary={summaryData}
                onSelectDay={handleSelectDay}
              />
            )}

            {activeTab === 'slider' && (
              <DaySliderDetail
                dates={datesList.length > 0 ? datesList : ['2026-08-16']}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </>
        )}
      </main>

      <footer className="glass-card border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Application Full-Stack Météo Soustons-Plage (Docker Compose)</span>
          <span>Sources : Open-Meteo, ECMWF IFS, GFS, Copernicus Marine, Archive 2021-2025</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
