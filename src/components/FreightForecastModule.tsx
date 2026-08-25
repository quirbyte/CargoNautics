import React, { useState, useMemo } from 'react';
import {
  LineChart as LucideLineChart,
  Cpu,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  BarChart3,
  Flame,
  Ship,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  ForecastHorizon,
  ModelAlgorithm,
  VesselClassName,
  FreightForecast
} from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { generateFreightForecast } from '../engine/forecastingEngine';

interface FreightForecastModuleProps {
  onSelectRouteForCharter?: (routeId: string, vesselClass: VesselClassName) => void;
}

export const FreightForecastModule: React.FC<FreightForecastModuleProps> = ({
  onSelectRouteForCharter,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ROUTE-AU-PARADIP');
  const [selectedVesselClass, setSelectedVesselClass] = useState<VesselClassName>('Capesize');
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>('30d');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<ModelAlgorithm>('HYBRID_ENSEMBLE');
  const [bunkerShockPct, setBunkerShockPct] = useState<number>(0);

  const selectedRoute = useMemo(() => {
    return MARITIME_ROUTES.find(r => r.id === selectedRouteId) || MARITIME_ROUTES[0];
  }, [selectedRouteId]);

  const forecast: FreightForecast = useMemo(() => {
    return generateFreightForecast(
      selectedRouteId,
      selectedVesselClass,
      selectedHorizon,
      selectedAlgorithm,
      bunkerShockPct
    );
  }, [selectedRouteId, selectedVesselClass, selectedHorizon, selectedAlgorithm, bunkerShockPct]);

  const vesselClasses: VesselClassName[] = [
    'Capesize',
    'Post-Panamax',
    'Kamsarmax',
    'Panamax',
    'Supramax',
    'Handysize'
  ];

  const horizons: { id: ForecastHorizon; label: string; sub: string }[] = [
    { id: '7d', label: '7 Days', sub: 'Spot Laycan Fixings' },
    { id: '30d', label: '30 Days', sub: 'Monthly Procurement' },
    { id: '90d', label: '90 Days', sub: 'Quarterly Planning' },
    { id: '180d', label: '180 Days', sub: 'Long-Term COA' },
  ];

  const algorithms: { id: ModelAlgorithm; name: string; tag: string }[] = [
    { id: 'HYBRID_ENSEMBLE', name: 'Hybrid Ensemble (Recommended)', tag: 'ARIMA + XGBoost + Prophet' },
    { id: 'GRADIENT_BOOSTED_ML', name: 'ML Gradient Boosting', tag: 'Bunker & Supply Non-linear' },
    { id: 'ARIMA_TIME_SERIES', name: 'Statistical Time-Series', tag: 'Autoregressive Harmonic' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Freight Rate Forecasting Engine</h2>
            <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              Explainable AI
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-horizon ocean freight projections (USD/MT) calibrated with Baltic fixture history, bunker pass-through, and ECI port bottlenecks.
          </p>
        </div>

        {onSelectRouteForCharter && (
          <button
            onClick={() => onSelectRouteForCharter(selectedRouteId, selectedVesselClass)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/30"
          >
            <Ship className="w-4 h-4" />
            <span>Optimize Charter for this Route</span>
          </button>
        )}
      </div>

      {/* Control Configuration Bar */}
      <div className="glass-panel p-4 rounded-2xl space-y-4">
        {/* Row 1: Route & Vessel Class Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              1. Select Origin-Destination Trade Route
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 hover:border-sky-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {MARITIME_ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} ({route.distanceNM.toLocaleString()} NM • ~{route.typicalVoyageDays}d)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              2. Vessel DWT Class
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {vesselClasses.map((cls) => {
                const isAllowed = selectedRoute.allowedVesselClasses.includes(cls);
                const isSelected = selectedVesselClass === cls;

                return (
                  <button
                    key={cls}
                    disabled={!isAllowed}
                    onClick={() => setSelectedVesselClass(cls)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-600/30'
                        : isAllowed
                        ? 'bg-navy-950 text-slate-300 hover:bg-navy-800 border border-navy-800'
                        : 'bg-navy-950/40 text-slate-600 border border-navy-900 cursor-not-allowed'
                    }`}
                  >
                    <span>{cls}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {cls === 'Capesize' ? '180k' : cls === 'Panamax' ? '75k' : cls === 'Supramax' ? '58k' : 'Lot'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Horizon, Model Architecture, Sensitivity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-navy-800">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Forecast Horizon Window
            </label>
            <div className="grid grid-cols-4 gap-1">
              {horizons.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHorizon(h.id)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition text-center ${
                    selectedHorizon === h.id
                      ? 'bg-emerald-600 text-white border border-emerald-400'
                      : 'bg-navy-950 text-slate-300 hover:bg-navy-800 border border-navy-800'
                  }`}
                >
                  <div>{h.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Forecasting Model Architecture
            </label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value as ModelAlgorithm)}
              className="w-full bg-navy-950 border border-navy-700 hover:border-sky-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-sky-300 focus:outline-none"
            >
              {algorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} ({algo.tag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Bunker Price Shock Simulator
              </label>
              <span className={`text-xs font-bold font-mono ${bunkerShockPct >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {bunkerShockPct >= 0 ? '+' : ''}{bunkerShockPct}%
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="35"
              step="5"
              value={bunkerShockPct}
              onChange={(e) => setBunkerShockPct(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>-25% Low Oil</span>
              <span>Baseline</span>
              <span>+35% Oil Shock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forecast Metrics & Summary Alert */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-sky-400">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spot Benchmark Rate</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ${forecast.currentSpotRateUSDperMT.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Based on latest Baltic fixture average</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-400">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {selectedHorizon} Point Forecast (P50)
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1 flex items-baseline gap-2">
            ${forecast.predictedRateUSDperMT.toFixed(2)}
            <span className={`text-xs font-bold ${forecast.changeVsSpotPct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ({forecast.changeVsSpotPct >= 0 ? '+' : ''}{forecast.changeVsSpotPct}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Horizon Target: {forecast.horizonDate}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-400">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">90% Confidence Interval</div>
          <div className="text-lg font-bold text-purple-300 font-mono mt-1">
            ${forecast.confidenceLowP10.toFixed(2)} — ${forecast.confidenceHighP90.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">P10 (Low) to P90 (High Risk Band)</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-400">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model Accuracy Rating</div>
          <div className="text-lg font-bold text-cyan-300 font-mono mt-1">
            MAPE: {forecast.mapeScore}% • RMSE: ${forecast.rmseScore}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 94.2% Directional Precision
          </div>
        </div>
      </div>

      {/* Strategic Rationale Recommendation Box */}
      <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">AI Chartering Rationale</div>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{forecast.recommendationSummary}</p>
        </div>
      </div>

      {/* Interactive Forecast Chart with P10/P50/P90 Confidence Envelope */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Probabilistic Freight Forecast Envelope (USD / MT)
            </div>
            <h3 className="text-sm font-bold text-white">
              {selectedRoute.name} • {selectedVesselClass} ({selectedHorizon})
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400"></span>
              <span className="text-slate-300">Historical Fixtures</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400"></span>
              <span className="text-emerald-300 font-bold">Predicted P50</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-sky-500/30 border border-sky-400/60 rounded-sm"></span>
              <span className="text-sky-300">P10 - P90 Band</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast.timeSeriesData}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b192c',
                  borderColor: '#0284c7',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: any, name: string) => [`$${Number(value).toFixed(2)}/MT`, name]}
              />
              <Legend verticalAlign="top" height={36} />

              {/* Confidence Band Envelope */}
              <Area
                type="monotone"
                dataKey="confidenceHigh"
                name="P90 High Bound"
                stroke="none"
                fill="#0284c7"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="confidenceLow"
                name="P10 Low Bound"
                stroke="none"
                fill="#070f1e"
                fillOpacity={1}
              />

              {/* Historical actual points */}
              <Line
                type="monotone"
                dataKey="historicalActual"
                name="Actual Fixture Rate"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#94a3b8' }}
              />

              {/* Predicted line */}
              <Line
                type="monotone"
                dataKey="predictedRate"
                name="Forecast P50"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Attribution & Driver Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explainability & Feature Contribution</div>
              <h3 className="text-sm font-bold text-white">Rate Driver Impact Attribution (USD/MT)</h3>
            </div>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={forecast.drivers}
                layout="vertical"
                margin={{ left: 40, right: 20 }}
              >
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v > 0 ? '+' : ''}$${v}`} />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={9} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b192c', borderColor: '#0284c7', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any) => [`${Number(val) > 0 ? '+' : ''}$${Number(val).toFixed(2)}/MT`, 'Net Rate Impact']}
                />
                <Bar dataKey="impactUSDperMT" radius={[0, 4, 4, 0]}>
                  {forecast.drivers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impactUSDperMT >= 0 ? '#f43f5e' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Descriptions Breakdown Table */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Driver Risk Factors & Market Context</div>
            <div className="space-y-2.5">
              {forecast.drivers.map((driver) => (
                <div key={driver.name} className="p-2.5 rounded-xl bg-navy-950/60 border border-navy-800 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{driver.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{driver.description}</div>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs shrink-0 ${
                    driver.impactUSDperMT >= 0 ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}>
                    {driver.impactUSDperMT >= 0 ? '+' : ''}${driver.impactUSDperMT.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
