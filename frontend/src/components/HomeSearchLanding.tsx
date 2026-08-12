import React, { useState } from 'react';
import { Search, MapPin, Sun, Waves, Sparkles, ArrowRight, ShieldCheck, Thermometer, Flame } from 'lucide-react';
import { LocationInfo } from '../types/meteo';

interface HomeSearchLandingProps {
  locations: LocationInfo[];
  selectedLocation: string;
  onSelectLocation: (locId: string) => void;
  onNavigateToOverview: () => void;
}

export const HomeSearchLanding: React.FC<HomeSearchLandingProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onNavigateToOverview
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 min-h-[360px] sm:min-h-[420px] flex items-center justify-center text-center p-6 sm:p-12">
        {/* Background Beach Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/hero_vacation_beach.jpg')` }}
        />
        {/* Glassmorphic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/60 to-slate-950/40 backdrop-blur-[2px]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-amber-300 text-xs sm:text-sm font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Aide à la Décision Météo Vacances • 16-30 Août 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md">
            Où passer vos meilleures <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 bg-clip-text text-transparent">vacances à la plage</span> ?
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 font-medium max-w-2xl mx-auto drop-shadow">
            Comparez en direct l'ensoleillement réel, l'indice UV, la température de l'eau et le score de bronzage entre l'<strong className="text-white font-extrabold">Océan Atlantique</strong> et la <strong className="text-white font-extrabold">Méditerranée</strong>.
          </p>

          {/* Search Input Bar */}
          <div className="max-w-xl mx-auto relative pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl border border-white/60 p-1.5 focus-within:ring-4 focus-within:ring-sky-400/40 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 mr-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une destination (Soustons, Canet, Landes, Méditerranée)..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none py-2 pr-4"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Destination Choice Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-500" />
              Destinations Disponibles pour les Vacances
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Sélectionnez une station balnéaire pour consulter son bulletin quinzaine complet
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {filteredLocations.length} destination(s)
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedLocation;
            const isAtlantique = loc.id === 'soustons-plage';

            return (
              <div
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc.id);
                  onNavigateToOverview();
                }}
                className={`group relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 border-2 bg-white/90 backdrop-blur-md shadow-md hover:shadow-2xl hover:-translate-y-1 ${
                  isSelected
                    ? 'border-sky-500 ring-4 ring-sky-500/15'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    isAtlantique
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    <Waves className="w-3.5 h-3.5" />
                    {loc.region}
                  </span>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-sky-600 transition-colors flex items-center gap-1">
                    Voir détails <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

                {/* Title & Badge */}
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Coordonnées : {loc.lat}°N, {loc.lon}°E • Prévisions Multi-Modèles 15 jours
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Score Vacances */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Score Vacances
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                      {loc.avg_score} <span className="text-xs text-slate-400 font-normal">/10</span>
                    </span>
                  </div>

                  {/* Eau de Mer */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      T° Eau de Mer
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-sky-600 flex items-center justify-center gap-0.5 mt-0.5">
                      <Thermometer className="w-4 h-4 text-sky-500 inline" /> {loc.avg_sea_temp}°C
                    </span>
                  </div>

                  {/* Journées Top */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Jours Top Plage
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                      <Sun className="w-4 h-4 text-amber-500 inline" /> {loc.top_days}/15
                    </span>
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {isAtlantique ? 'Brise Marine & Vagues Surf' : 'Eau Chaude & Mer Calme'}
                  </span>
                  <button className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold group-hover:bg-sky-600 transition-colors shadow-md">
                    Choisir cette destination
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-semibold">Aucune destination ne correspond à "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-sky-600 hover:underline"
            >
              Afficher toutes les destinations
            </button>
          </div>
        )}
      </div>

      {/* Decision Features Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-extrabold text-amber-300 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Pourquoi faire confiance à notre comparateur ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
            Notre moteur n'affiche pas une météo générique. Il croise en temps réel <strong className="text-amber-300 font-extrabold">ECMWF</strong>, <strong className="text-amber-300 font-extrabold">GFS</strong>, <strong className="text-amber-300 font-extrabold">ICON</strong> et <strong className="text-amber-300 font-extrabold">Météo-France</strong> pour garantir zéro fausse promesse sur le soleil et les températures de plage.
          </p>
        </div>
        <button
          onClick={onNavigateToOverview}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-sm hover:from-amber-300 hover:to-amber-400 shadow-lg shrink-0 transform hover:scale-105 transition-all"
        >
          Consulter le bulletin quinzaine →
        </button>
      </div>

    </div>
  );
};
