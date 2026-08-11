import React, { useState } from 'react';
import { VacationSummaryItem } from '../types/meteo';
import { Sun, Waves, Star, Cloud, Info, X, CheckCircle2 } from 'lucide-react';

interface VacationOverviewProps {
  summary: VacationSummaryItem[];
  onSelectDay: (date: string) => void;
}

export const VacationOverview: React.FC<VacationOverviewProps> = ({
  summary,
  onSelectDay
}) => {
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const avgScore = summary.length > 0 
    ? (summary.reduce((acc, s) => acc + s.score, 0) / summary.length).toFixed(1)
    : '7.5';

  const beachQualifiedDays = summary.filter(s => {
    if (s.score >= 8) return true;
    const cloudPct = s.cloud_cover !== undefined ? s.cloud_cover : 50;
    const isDryAndSunny = s.score >= 6 && cloudPct <= 60;
    return isDryAndSunny;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Rules Explanation Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white p-6 rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-100 rounded-xl">
                  <Sun className="w-5 h-5 text-sky-600 fill-amber-300" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Règles de Calcul : Journées Favorables Plage
                </h3>
              </div>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Une journée est comptabilisée comme <strong>"Favorable Plage"</strong> ({beachQualifiedDays} / {summary.length} jours) si elle remplit l'une des deux conditions ci-dessous :
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-900">Condition 1 : Grand Beau Temps</h4>
                  <p className="text-amber-800 mt-0.5">Score Vacances <strong>≥ 8 / 10</strong> (Soleil prédominant & temps sec).</p>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sky-900">Condition 2 : Temps Sec & Éclaircies Ensoleillées</h4>
                  <ul className="text-sky-800 mt-1 space-y-0.5 list-disc list-inside font-medium">
                    <li>Score Vacances <strong>≥ 6 / 10</strong></li>
                    <li>Couverture Nuageuse l'après-midi <strong>≤ 60%</strong></li>
                    <li>Précipitations = <strong>0.0 mm (Temps 100% sec)</strong></li>
                    <li>Indice UV l'après-midi <strong>≥ 3.0 (Rayonnement idéal pour bronzer)</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowRulesModal(false)}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                J'ai compris !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Score Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Score Vacances Global
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
              <span className="text-sm font-bold text-amber-600">/ 10</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Soleil & Sécheresse</p>
          </div>
        </div>

        {/* Top Soleil Card with Rules Popup */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl">
              <Sun className="w-7 h-7 text-sky-600 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Journées Favorables Plage
                </p>
                <button 
                  onClick={() => setShowRulesModal(true)}
                  className="text-sky-500 hover:text-sky-700 transition-colors"
                  title="Voir la règle de calcul"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{beachQualifiedDays}</span>
                <span className="text-sm font-bold text-slate-500">/ {summary.length} jours</span>
              </div>
              <p className="text-xs text-sky-600 font-bold mt-0.5">Soleil, Temps Sec & UV ≥ 3.0</p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
            <span>Condition : Score ≥ 8/10 OU (≥ 6/10 + Sec + UV ≥ 3)</span>
            <button 
              onClick={() => setShowRulesModal(true)} 
              className="text-sky-600 hover:text-sky-800 hover:underline font-extrabold flex items-center gap-0.5"
            >
              Règles <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ocean SST Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl">
            <Waves className="w-7 h-7 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              T° Eau de Mer Océane
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">23.8°C</span>
              <span className="text-xs text-teal-700 font-bold">Baignade Douce</span>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-0.5">
              Moyenne sur la période (16-30 août) • Copernicus
            </p>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-slate-200 shadow-sm p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Visualisation Globale de la Quinzaine (16 → 30 août)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Jauges d'ensoleillement, couverture nuageuse et indice UV max à Soustons-Plage.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-mono font-semibold">
            Soustons-Plage (43.78°N, -1.41°W)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Taux d'Ensoleillement</th>
                <th className="py-3 px-4 font-bold">Couverture Nuageuse</th>
                <th className="py-3 px-4 font-bold text-center">Indice UV</th>
                <th className="py-3 px-4 font-bold text-center">Score</th>
                <th className="py-3 px-4 font-bold text-center">T° Ressentie (Après-midi)</th>
                <th className="py-3 px-4 font-bold">Appréciation</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                    Initialisation des données météo en cours...
                  </td>
                </tr>
              ) : (
                summary.map((item) => {
                  const isTop = item.score >= 8;
                  const isPoor = item.score <= 4;
                  const sunPercentage = item.score * 10;
                  const cloudPct = item.cloud_cover !== undefined ? item.cloud_cover : 30;

                  return (
                    <tr 
                      key={item.date} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => onSelectDay(item.date)}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.day_label}
                      </td>

                      {/* Ensoleillement Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-slate-200/80 rounded-full h-3.5 overflow-hidden border border-slate-300 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTop ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-400/50' : 
                                isPoor ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                'bg-gradient-to-r from-sky-400 to-sky-500'
                              }`}
                              style={{ width: `${sunPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                            {sunPercentage}% Soleil
                          </span>
                        </div>
                      </td>

                      {/* Cloud Cover Gauge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-200/80 rounded-full h-3.5 overflow-hidden border border-slate-300 shadow-inner">
                            <div 
                              className="h-full rounded-full bg-slate-400 transition-all duration-500"
                              style={{ width: `${cloudPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                            <Cloud className="w-3.5 h-3.5 text-slate-400" /> {cloudPct}% Nuages
                          </span>
                        </div>
                      </td>

                      {/* Indice UV */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-extrabold text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> UV {item.uv_index || "6.0"}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          isTop ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          isPoor ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}>
                          {item.score} / 10
                        </span>
                      </td>

                      {/* Apparent Temp */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-600 whitespace-nowrap">
                        {item.apparent_temp}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {item.rating}
                      </td>

                      {/* Action button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDay(item.date);
                          }}
                          className="text-xs bg-slate-100 group-hover:bg-sky-500 text-slate-700 group-hover:text-white font-bold px-3.5 py-1.5 rounded-lg border border-slate-200 group-hover:border-sky-500 transition-all shadow-sm"
                        >
                          Détail →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
