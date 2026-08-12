import React from 'react';
import { Sun, RefreshCw, Calendar, Sparkles, MapPin, Compass } from 'lucide-react';
import { LocationInfo } from '../types/meteo';

interface NavbarProps {
  activeTab: 'home' | 'overview' | 'slider';
  setActiveTab: (tab: 'home' | 'overview' | 'slider') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  locations: LocationInfo[];
  selectedLocation: string;
  onSelectLocation: (locId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  locations,
  selectedLocation,
  onSelectLocation
}) => {
  const currentLoc = locations.find(l => l.id === selectedLocation) || locations[0];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-200 px-4 lg:px-8 py-3 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Location Selector */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
          >
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-2.5 rounded-xl shadow-md shadow-amber-500/20">
              <Sun className="w-6 h-6 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  Vacances Météo Plage
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">
                  Multi-Destinations
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === 'home' 
                  ? 'Aide à la décision & prévisions quinzaine • 16-30 Août 2026' 
                  : `${currentLoc.name} (${currentLoc.region}) • 16-30 Août 2026`}
              </p>
            </div>
          </button>

          {/* Quick Location Dropdown Picker */}
          <div className="ml-2 pl-3 border-l border-slate-200 hidden lg:block">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">
              Destination Actuelle
            </label>
            <div className="relative inline-flex items-center">
              <MapPin className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => {
                  onSelectLocation(e.target.value);
                  if (activeTab === 'home') setActiveTab('overview');
                }}
                className="pl-7 pr-7 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.region.split('•')[0].trim()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-4 h-4" /> Accueil & Choix
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Vue Quinzaine
          </button>
          
          <button
            onClick={() => setActiveTab('slider')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'slider'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-4 h-4" /> Jour par Jour
          </button>
        </div>

        {/* Big Rainbow Pulsing Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500 hover:from-amber-600 hover:via-rose-600 hover:to-sky-600 shadow-md rainbow-glow transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white font-extrabold ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="tracking-wide hidden sm:inline">
            {isRefreshing ? 'Mise à jour...' : '⚡ Actualiser API'}
          </span>
          <span className="tracking-wide sm:hidden">
            {isRefreshing ? 'Mise à jour...' : '⚡ Actualiser'}
          </span>
        </button>
      </div>
    </header>
  );
};
