import React from 'react';
import { Sun, Waves, RefreshCw, Calendar, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'slider';
  setActiveTab: (tab: 'overview' | 'slider') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-200 px-4 lg:px-8 py-4 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Location */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-2.5 rounded-xl shadow-md shadow-amber-500/20">
            <Sun className="w-6 h-6 text-white font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Soustons-Plage Météo
              </h1>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-sky-600" /> Littoral Océan
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              16 août → 30 août 2026 • Ingestion Multi-Modèles API
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Vue Vacances Globale
          </button>
          
          <button
            onClick={() => setActiveTab('slider')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'slider'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-4 h-4" /> Détail Jour par Jour
          </button>
        </div>

        {/* Big Rainbow Pulsing Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="relative group overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500 hover:from-amber-600 hover:via-rose-600 hover:to-sky-600 shadow-lg rainbow-glow transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-white font-extrabold ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="tracking-wide">
            {isRefreshing ? 'Mise à jour en cours...' : '⚡ Actualiser les API Météo'}
          </span>
        </button>
      </div>
    </header>
  );
};
