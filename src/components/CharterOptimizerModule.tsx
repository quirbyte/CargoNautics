import React, { useState, useMemo } from 'react';
import {
  Ship,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
  FileCheck,
  Sparkles,
  ChevronRight,
  Anchor,
  Flame,
  Award,
  CalendarCheck
} from 'lucide-react';
import {
  VesselClassName,
  CharterType,
  CharterRecommendation,
  CharterStrategyEvaluation,
  UserRole
} from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { ECI_PORTS_DATA } from '../data/portsData';
import {
  evaluateCharterStrategies,
  generateCharterRecommendation
} from '../engine/charterOptimizer';
import { calculateLaytimeAndDemurrage } from '../engine/demurrageEngine';

interface CharterOptimizerModuleProps {
  initialRouteId?: string;
  initialVesselClass?: VesselClassName;
  currentRole: UserRole;
  onSubmitRecommendationForApproval: (reco: CharterRecommendation) => void;
}

export const CharterOptimizerModule: React.FC<CharterOptimizerModuleProps> = ({
  initialRouteId = 'ROUTE-AU-PARADIP',
  initialVesselClass = 'Capesize',
  currentRole,
  onSubmitRecommendationForApproval,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId);
  const [selectedVesselClass, setSelectedVesselClass] = useState<VesselClassName>(initialVesselClass);
  const [cargoQuantityMT, setCargoQuantityMT] = useState<number>(150000);
  const [annualVolumeMT, setAnnualVolumeMT] = useState<number>(600000);
  const [laycanStart, setLaycanStart] = useState<string>('2026-09-02');
  const [laycanEnd, setLaycanEnd] = useState<string>('2026-09-12');

  // Interactive Laytime Calculator parameters
  const [dischargeRateMT, setDischargeRateMT] = useState<number>(22000);
  const [loadingRateMT, setLoadingRateMT] = useState<number>(28000);
  const [weatherDelayDays, setWeatherDelayDays] = useState<number>(0.5);

  const selectedRoute = useMemo(() => {
    return MARITIME_ROUTES.find(r => r.id === selectedRouteId) || MARITIME_ROUTES[0];
  }, [selectedRouteId]);

  const targetPort = useMemo(() => {
    return ECI_PORTS_DATA.find(p => p.name.toLowerCase().includes(selectedRoute.dischargePort.toLowerCase().split(' ')[0])) || ECI_PORTS_DATA[0];
  }, [selectedRoute]);

  const strategies: CharterStrategyEvaluation[] = useMemo(() => {
    return evaluateCharterStrategies(selectedRouteId, selectedVesselClass, cargoQuantityMT, annualVolumeMT);
  }, [selectedRouteId, selectedVesselClass, cargoQuantityMT, annualVolumeMT]);

  const recommendation: CharterRecommendation = useMemo(() => {
    return generateCharterRecommendation(
      selectedRouteId,
      selectedVesselClass,
      cargoQuantityMT,
      laycanStart,
      laycanEnd
    );
  }, [selectedRouteId, selectedVesselClass, cargoQuantityMT, laycanStart, laycanEnd]);

  const laytimeDetails = useMemo(() => {
    return calculateLaytimeAndDemurrage(
      cargoQuantityMT,
      targetPort,
      loadingRateMT,
      dischargeRateMT,
      weatherDelayDays
    );
  }, [cargoQuantityMT, targetPort, loadingRateMT, dischargeRateMT, weatherDelayDays]);

  const vesselClasses: VesselClassName[] = [
    'Capesize',
    'Post-Panamax',
    'Kamsarmax',
    'Panamax',
    'Supramax',
    'Handysize'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Vessel Chartering Strategy Optimizer</h2>
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Optimal Fixture Discovery
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-factor evaluation of Voyage Charter vs. Time Charter vs. COA contracts, candidate vessel RightShip ranking, and demurrage exposure modeling.
          </p>
        </div>

        <button
          onClick={() => onSubmitRecommendationForApproval(recommendation)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40"
        >
          <FileCheck className="w-4 h-4" />
          <span>Submit Recommendation for Sign-off</span>
        </button>
      </div>

      {/* Primary Configuration Bar */}
      <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Target Trade Route
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {MARITIME_ROUTES.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Vessel DWT Class
          </label>
          <select
            value={selectedVesselClass}
            onChange={(e) => setSelectedVesselClass(e.target.value as VesselClassName)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            {vesselClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Cargo Parcel Size (MT)
          </label>
          <input
            type="number"
            step="5000"
            value={cargoQuantityMT}
            onChange={(e) => setCargoQuantityMT(Number(e.target.value))}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Annual Sourcing Volume (MT/yr)
          </label>
          <input
            type="number"
            step="50000"
            value={annualVolumeMT}
            onChange={(e) => setAnnualVolumeMT(Number(e.target.value))}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 3 Core Chartering Strategy Cards (Voyage vs TC vs COA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {strategies.map((strat) => {
          return (
            <div
              key={strat.charterType}
              className={`p-5 rounded-2xl relative transition-all flex flex-col justify-between ${
                strat.isRecommended
                  ? 'glass-panel-glow border-2 border-emerald-400/80 bg-navy-900/90 shadow-xl'
                  : 'glass-panel border-navy-800 bg-navy-950/60 opacity-90'
              }`}
            >
              {strat.isRecommended && (
                <div className="absolute -top-3 right-4 bg-emerald-500 text-navy-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Recommended Strategy
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-white">{strat.charterType}</div>
                  <span className="text-[11px] font-mono text-slate-400">Score: {strat.suitabilityScore}/100</span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-navy-950/80 border border-navy-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected Unit Freight</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    ${strat.expectedCostUSDperMT.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ MT</span>
                  </div>
                  <div className="text-xs text-sky-400 font-mono mt-1 font-semibold">
                    Total: ${strat.totalCostUSD.toLocaleString()}
                  </div>
                </div>

                {/* Pros */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Strategic Advantages</div>
                  {strat.pros.map((p, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>

                {/* Cons */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risks & Liabilities</div>
                  {strat.cons.map((c, i) => (
                    <div key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Risk Index: {strat.riskScore}/100</span>
                <span>{strat.breakEvenThresholdDays > 0 ? `Break-even: ${strat.breakEvenThresholdDays}d` : 'Index Linked'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimal Laycan Window & Timing Recommendation */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-cyan-400" />
              <span>Recommended Laycan & Fixture Timing Window</span>
            </div>
            <h3 className="text-lg font-black text-white font-mono mt-1">
              Laycan: {recommendation.recommendedLaycanWindow.start} — {recommendation.recommendedLaycanWindow.end}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Optimal Fixture Decision Date: <span className="text-emerald-400 font-bold font-mono">{recommendation.recommendedLaycanWindow.optimalFixtureDate}</span> (3-4 days ahead of cancelling laycan).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Total Ocean Freight</div>
              <div className="text-base font-bold text-white">${recommendation.expectedTotalFreightUSD.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Demurrage Risk Exposure</div>
              <div className="text-base font-bold text-rose-400">${recommendation.expectedDemurrageRiskUSD.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Vessels Ranking Matrix */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Fleet Vetting & Ranking</div>
            <h3 className="text-sm font-bold text-white">Ranked Candidate Vessels for {selectedVesselClass} ({selectedRoute.dischargePort})</h3>
          </div>
          <span className="text-xs text-sky-400 font-mono">
            {recommendation.rankedVessels.length} Qualified Vessels Available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 pl-2">Rank & Vessel Name</th>
                <th className="pb-2">DWT / Age / Flag</th>
                <th className="pb-2">RightShip Vetting</th>
                <th className="pb-2">Daily Hire (USD)</th>
                <th className="pb-2">Eco Speed / Bunker</th>
                <th className="pb-2">Current Location & ETA</th>
                <th className="pb-2">Laycan Status</th>
                <th className="pb-2 pr-2 text-right">Composite Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {recommendation.rankedVessels.map((vessel, index) => {
                const isTopRank = index === 0;

                return (
                  <tr
                    key={vessel.id}
                    className={`hover:bg-navy-800/50 transition ${isTopRank ? 'bg-sky-950/30' : ''}`}
                  >
                    <td className="py-3 pl-2 font-sans font-bold text-slate-100 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isTopRank ? 'bg-amber-400 text-navy-950' : 'bg-navy-800 text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <div>{vessel.name}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{vessel.ownerRating}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{(vessel.dwt / 1000).toFixed(0)}k DWT</div>
                      <div className="text-[10px] text-slate-400 font-sans">{2026 - vessel.builtYear}y old • {vessel.flag}</div>
                    </td>
                    <td className="py-3 font-sans">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white">{vessel.vettingScore}</span>
                        <span className="text-amber-400">★</span>
                        <span className="text-[10px] text-slate-400">/ 5.0</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GHG Class {vessel.ghgRating}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      ${vessel.dailyHireRateUSD.toLocaleString()}/d
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{vessel.ecoSpeedKnots} kts</div>
                      <div className="text-[10px] text-slate-400">{vessel.fuelConsumptionTonsPerDay} MT/d VLSFO</div>
                    </td>
                    <td className="py-3 font-sans text-slate-300">
                      <div className="truncate max-w-[140px]">{vessel.currentLocation}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">ETA: {vessel.etaDays} days</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold font-sans ${
                        vessel.laycanCompliance === 'Optimal'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : vessel.laycanCompliance === 'Tight'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}>
                        {vessel.laycanCompliance}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-sans">
                      <div className="text-sm font-black text-sky-300">{vessel.compositeRankScore}</div>
                      <div className="text-[9px] text-slate-400 font-mono">/ 100 Index</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Demurrage / Despatch Calculator */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laytime & Demurrage Exposure Engine</div>
            <h3 className="text-sm font-bold text-white">Port Time & Despatch / Demurrage Financial Simulator</h3>
          </div>
          <span className="text-xs text-rose-400 font-bold bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
            Port Demurrage Rate: ${targetPort.demurrageRatePerDayUSD.toLocaleString()}/day
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Agreed Discharge Rate (MT / Day WWD SHINC)
            </label>
            <input
              type="number"
              step="1000"
              value={dischargeRateMT}
              onChange={(e) => setDischargeRateMT(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Agreed Loading Rate (MT / Day WWD SHINC)
            </label>
            <input
              type="number"
              step="1000"
              value={loadingRateMT}
              onChange={(e) => setLoadingRateMT(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Expected Weather / Monsoon Disruption (Days)
            </label>
            <input
              type="number"
              step="0.5"
              value={weatherDelayDays}
              onChange={(e) => setWeatherDelayDays(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
            />
          </div>
        </div>

        {/* Demurrage Results Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <div className="text-[10px] text-slate-400">Total Allowed Laytime</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">{laytimeDetails.totalAllowedLaytimeDays} Days</div>
          </div>

          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <div className="text-[10px] text-slate-400">Estimated Port Stay</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">{laytimeDetails.estimatedPortStayDays} Days</div>
          </div>

          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <div className="text-[10px] text-slate-400">Net Demurrage Days</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              {laytimeDetails.netDemurrageDays > 0 ? `+${laytimeDetails.netDemurrageDays} Days` : '0 Days (Despatch)'}
            </div>
          </div>

          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <div className="text-[10px] text-slate-400">Net Demurrage Exposure</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              ${laytimeDetails.totalDemurrageCostUSD.toLocaleString()} (${laytimeDetails.exposurePerMTUSD.toFixed(2)}/MT)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
