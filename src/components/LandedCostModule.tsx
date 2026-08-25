import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { VesselClassName, LandedCostBreakdown, OriginComparisonItem } from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { calculateLandedCost, compareSourcingOrigins } from '../engine/landedCostEngine';
import { exportLandedCostExcel } from '../utils/exportUtils';
import { INITIAL_FX_RATES } from '../data/marketData';

export const LandedCostModule: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ROUTE-AU-PARADIP');
  const [selectedVesselClass, setSelectedVesselClass] = useState<VesselClassName>('Capesize');
  const [fobPriceUSD, setFobPriceUSD] = useState<number>(225.00);
  const [cargoQuantityMT, setCargoQuantityMT] = useState<number>(150000);

  // What-if Sensitivity Sliders
  const [bunkerAdjustmentPct, setBunkerAdjustmentPct] = useState<number>(0);
  const [usdInrRate, setUsdInrRate] = useState<number>(INITIAL_FX_RATES[0].rate);
  const [extraPortDelayDays, setExtraPortDelayDays] = useState<number>(0);

  const selectedRoute = useMemo(() => {
    return MARITIME_ROUTES.find(r => r.id === selectedRouteId) || MARITIME_ROUTES[0];
  }, [selectedRouteId]);

  const landedCost: LandedCostBreakdown = useMemo(() => {
    return calculateLandedCost({
      fobPriceUSDperMT: fobPriceUSD,
      routeId: selectedRouteId,
      vesselClass: selectedVesselClass,
      cargoQuantityMT,
      bunkerAdjustmentPct,
      usdInrRate,
      extraPortDelayDays,
    });
  }, [fobPriceUSD, selectedRouteId, selectedVesselClass, cargoQuantityMT, bunkerAdjustmentPct, usdInrRate, extraPortDelayDays]);

  const sourcingComparisons: OriginComparisonItem[] = useMemo(() => {
    return compareSourcingOrigins('Coking Coal', cargoQuantityMT, usdInrRate);
  }, [cargoQuantityMT, usdInrRate]);

  // Waterfall Chart Data
  const waterfallData = [
    { name: 'FOB Cargo', costUSD: landedCost.cargoPriceUSDperMT, fill: '#0284c7' },
    { name: 'Ocean Freight', costUSD: landedCost.oceanFreightUSDperMT, fill: '#10b981' },
    { name: 'Insurance', costUSD: landedCost.marineInsuranceUSDperMT, fill: '#8b5cf6' },
    { name: 'Port Charges', costUSD: landedCost.portTariffsUSDperMT + landedCost.stevedoringUSDperMT, fill: '#f59e0b' },
    { name: 'Demurrage', costUSD: landedCost.demurrageRiskUSDperMT, fill: '#f43f5e' },
  ];

  const handleExportExcel = () => {
    const exportData = sourcingComparisons.map(s => ({
      'Origin Name': s.originName,
      'Country': s.originCountry,
      'Load Port': s.loadPort,
      'Discharge Port': s.dischargePort,
      'Transit Days': s.transitDays,
      'FOB Price (USD/MT)': s.fobPriceUSDperMT,
      'Ocean Freight (USD/MT)': s.freightUSDperMT,
      'Insurance (USD/MT)': s.insuranceUSDperMT,
      'Port Charges (USD/MT)': s.portChargesUSDperMT,
      'Demurrage Risk (USD/MT)': s.demurrageRiskUSDperMT,
      'Total Landed Cost (USD/MT)': s.landedCostUSDperMT,
      'Total Landed Cost (INR/MT)': s.landedCostINRperMT,
      'Quality CV (kcal)': s.qualityCV_kcal || 'N/A',
      'Cost per GCV (INR/kcal)': s.costPerGCV_INR || 'N/A',
    }));
    exportLandedCostExcel(exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Total Landed Cost Simulator & Sourcing Matrix</h2>
            <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              INR/MT Optimization
            </span>
          </div>
          <p className="text-xs text-slate-400">
            End-to-end landed cost simulation: FOB Price + Ocean Freight + Insurance + Port Dues + Demurrage Exposure converted to INR/MT.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/40"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Landed Cost Sheet (.xlsx)</span>
        </button>
      </div>

      {/* Main Landed Cost Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-panel-glow border-2 border-sky-400/80 bg-navy-900/90 shadow-xl">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Total Net Landed Cost (INR / MT)</div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            ₹{landedCost.totalLandedCostINRperMT.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            Total Lot Outlay: <span className="text-sky-300 font-bold">₹{(landedCost.totalLandedCostTotalINR / 10000000).toFixed(2)} Crores</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-navy-700">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Landed Cost (USD / MT)</div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            ${landedCost.totalLandedCostUSDperMT.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            At FX Reference: <span className="text-emerald-400 font-bold">1 USD = ₹{landedCost.usdInrRate.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-navy-700">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Freight & Port Share of Landed Cost</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {Math.round(((landedCost.oceanFreightUSDperMT + landedCost.portTariffsUSDperMT + landedCost.stevedoringUSDperMT) / landedCost.totalLandedCostUSDperMT) * 100)}%
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            Logistics Component: <span className="text-emerald-300 font-bold">${(landedCost.oceanFreightUSDperMT + landedCost.portTariffsUSDperMT + landedCost.stevedoringUSDperMT).toFixed(2)}/MT</span>
          </div>
        </div>
      </div>

      {/* Interactive Parameters & What-If Sensitivity Panel */}
      <div className="glass-panel p-5 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Live What-If Scenario & Sensitivity Controls</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Trade Route
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              {MARITIME_ROUTES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Vessel Class
            </label>
            <select
              value={selectedVesselClass}
              onChange={(e) => setSelectedVesselClass(e.target.value as VesselClassName)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              {['Capesize', 'Post-Panamax', 'Kamsarmax', 'Panamax', 'Supramax', 'Handysize'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              FOB Cargo Price (USD/MT)
            </label>
            <input
              type="number"
              step="1"
              value={fobPriceUSD}
              onChange={(e) => setFobPriceUSD(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Parcel Size (MT)
            </label>
            <input
              type="number"
              step="5000"
              value={cargoQuantityMT}
              onChange={(e) => setCargoQuantityMT(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
            />
          </div>
        </div>

        {/* Sliders: Bunker Shock, USD/INR FX, Port Delay */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 border-t border-navy-800">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Bunker Price Shock
              </label>
              <span className={`text-xs font-mono font-bold ${bunkerAdjustmentPct >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {bunkerAdjustmentPct >= 0 ? '+' : ''}{bunkerAdjustmentPct}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={bunkerAdjustmentPct}
              onChange={(e) => setBunkerAdjustmentPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>-30%</span>
              <span>Baseline</span>
              <span>+30%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                USD / INR Currency Rate
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">
                ₹{usdInrRate.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="80.0"
              max="90.0"
              step="0.25"
              value={usdInrRate}
              onChange={(e) => setUsdInrRate(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>₹80.00</span>
              <span>₹84.15 (Spot)</span>
              <span>₹90.00 (Stress)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Port Congestion Extra Delay
              </label>
              <span className="text-xs font-mono font-bold text-rose-400">
                +{extraPortDelayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={extraPortDelayDays}
              onChange={(e) => setExtraPortDelayDays(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>0 Days (Normal)</span>
              <span>+2.5d</span>
              <span>+5.0d (Monsoon Surge)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Waterfall Chart & Itemized Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cost Component Decomposition (USD / MT)</div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b192c', borderColor: '#0284c7', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}/MT`, 'Component Cost']}
                />
                <Bar dataKey="costUSD" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Itemized Landed Cost Structure</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-navy-950 border border-navy-800">
                <span className="font-sans text-slate-300">FOB Commodity Cargo Price</span>
                <span className="font-bold text-white">${landedCost.cargoPriceUSDperMT.toFixed(2)} / MT</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-navy-950 border border-navy-800">
                <span className="font-sans text-slate-300">Ocean Freight ({selectedVesselClass})</span>
                <span className="font-bold text-emerald-400">${landedCost.oceanFreightUSDperMT.toFixed(2)} / MT</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-navy-950 border border-navy-800">
                <span className="font-sans text-slate-300">Marine Cargo Insurance (0.35%)</span>
                <span className="font-bold text-purple-300">${landedCost.marineInsuranceUSDperMT.toFixed(2)} / MT</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-navy-950 border border-navy-800">
                <span className="font-sans text-slate-300">Port Tariffs & Stevedoring ({selectedRoute.dischargePort})</span>
                <span className="font-bold text-amber-300">${(landedCost.portTariffsUSDperMT + landedCost.stevedoringUSDperMT).toFixed(2)} / MT</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-navy-950 border border-navy-800">
                <span className="font-sans text-slate-300">Expected Demurrage Risk Exposure</span>
                <span className="font-bold text-rose-400">${landedCost.demurrageRiskUSDperMT.toFixed(2)} / MT</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-200">Total Net Landed Cost:</span>
            <span className="text-sky-300 font-mono text-base">${landedCost.totalLandedCostUSDperMT.toFixed(2)} / MT (₹{landedCost.totalLandedCostINRperMT.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Multi-Origin Sourcing Matrix Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Origin Sourcing Comparator Matrix</h3>
              <p className="text-[11px] text-slate-400">Side-by-side landed cost & quality GCV parity comparison across global load ports</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 pl-2">Sourcing Origin & Load Port</th>
                <th className="pb-2">Discharge Port</th>
                <th className="pb-2">Transit Days</th>
                <th className="pb-2">FOB (USD/MT)</th>
                <th className="pb-2">Freight (USD/MT)</th>
                <th className="pb-2">Port Dues</th>
                <th className="pb-2">Quality (GCV)</th>
                <th className="pb-2">Landed Cost (USD/MT)</th>
                <th className="pb-2 pr-2 text-right">Landed Cost (INR/MT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {sourcingComparisons.map((orig) => {
                return (
                  <tr
                    key={orig.originName}
                    className={`hover:bg-navy-800/50 transition ${orig.isCheapest ? 'bg-emerald-950/30' : ''}`}
                  >
                    <td className="py-3 pl-2 font-sans font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {orig.isCheapest && <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span>{orig.originName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{orig.loadPort} ({orig.originCountry})</span>
                    </td>
                    <td className="py-3 font-sans text-slate-300">{orig.dischargePort}</td>
                    <td className="py-3 text-slate-300">{orig.transitDays} Days</td>
                    <td className="py-3 font-bold text-white">${orig.fobPriceUSDperMT.toFixed(2)}</td>
                    <td className="py-3 text-emerald-400">${orig.freightUSDperMT.toFixed(2)}</td>
                    <td className="py-3 text-slate-300">${orig.portChargesUSDperMT.toFixed(2)}</td>
                    <td className="py-3 text-slate-300 font-sans">
                      <div>{orig.qualityCV_kcal} kcal/kg</div>
                      <span className="text-[10px] text-slate-400">₹{orig.costPerGCV_INR}/kcal</span>
                    </td>
                    <td className="py-3 font-bold text-white">${orig.landedCostUSDperMT.toFixed(2)}</td>
                    <td className="py-3 pr-2 text-right">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                        orig.isCheapest
                          ? 'bg-emerald-500 text-navy-950 font-black shadow-md'
                          : 'bg-navy-950 text-sky-300 border border-navy-800'
                      }`}>
                        ₹{orig.landedCostINRperMT.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
