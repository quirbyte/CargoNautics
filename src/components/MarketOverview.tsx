import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Anchor,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MarketIndexItem, BunkerPriceItem, FXRateItem } from '../types';
import { ECI_PORTS_DATA } from '../data/portsData';

interface MarketOverviewProps {
  marketIndices: MarketIndexItem[];
  bunkerPrices: BunkerPriceItem[];
  fxRates: FXRateItem[];
  onTriggerForecast: () => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  marketIndices,
  bunkerPrices,
  fxRates,
  onTriggerForecast,
}) => {
  const [selectedIndexCode, setSelectedIndexCode] = useState<string>('BDI');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedIndex = marketIndices.find(i => i.code === selectedIndexCode) || marketIndices[0];

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Market Intelligence & Live Ingestion</h2>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Feeds Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Baltic Exchange indices, bunker fuel benchmarks, FX exchange rates, and ECI port congestion telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Polling Feeds...' : 'Refresh Feeds'}</span>
          </button>

          <button
            onClick={onTriggerForecast}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/30"
          >
            <Activity className="w-4 h-4" />
            <span>Generate Rate Forecast</span>
          </button>
        </div>
      </div>

      {/* Baltic Indices Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketIndices.map((idx) => {
          const isSelected = idx.code === selectedIndexCode;
          const isPositive = idx.change1d >= 0;

          return (
            <div
              key={idx.code}
              onClick={() => setSelectedIndexCode(idx.code)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'glass-panel-glow border-sky-400/50 bg-navy-800/90'
                  : 'glass-panel hover:border-navy-700 bg-navy-900/60 hover:bg-navy-850/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-sky-400 font-mono">{idx.code}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{idx.name}</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {idx.value.toLocaleString()}
                  </div>
                </div>

                <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                  isPositive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPositive ? '+' : ''}{idx.change1d} ({Math.abs(idx.change1dPct)}%)</span>
                </div>
              </div>

              {/* 52-Week Gauge */}
              <div className="mt-3 pt-3 border-t border-navy-800 text-[10px] text-slate-400 flex justify-between items-center font-mono">
                <span>52W Low: {idx.low52w}</span>
                <span className="text-emerald-400 font-semibold">30d: +{idx.change30dPct}%</span>
                <span>52W High: {idx.high52w}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Index Interactive Chart & Driver Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Index Trajectory</div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedIndex.name} ({selectedIndex.code})</span>
                <span className="text-xs font-mono font-normal text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                  Current: {selectedIndex.value}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Timeframe:</span>
              <span className="text-[11px] font-bold text-sky-300 bg-navy-800 px-2 py-1 rounded border border-navy-700">
                Last 30 Days (Daily Fixings)
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedIndex.historical}>
                <defs>
                  <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b192c',
                    borderColor: '#0284c7',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#indexGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bunker Benchmarks & FX Panel */}
        <div className="space-y-4">
          {/* Bunker Fuel Card */}
          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Bunker Fuel Benchmarks (USD/MT)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Platts / Argus</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {bunkerPrices.map(bp => (
                <div key={bp.port} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-navy-950/60 border border-navy-800/80">
                  <div>
                    <div className="font-semibold text-slate-200">{bp.port}</div>
                    <div className="text-[10px] text-slate-400 font-mono">MGO: ${bp.mgoUSD.toFixed(1)}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-amber-300">${bp.vlsfoUSD.toFixed(1)} <span className="text-[10px] text-slate-400">VLSFO</span></div>
                    <div className={`text-[10px] ${bp.changeVlsfo >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {bp.changeVlsfo >= 0 ? '+' : ''}${bp.changeVlsfo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FX Rates Card */}
          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Currency Exchange (USD Cross Rates)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">RBI / FX Spot</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {fxRates.map(fx => (
                <div key={fx.pair} className="p-2 rounded-lg bg-navy-950/60 border border-navy-800/80">
                  <div className="text-[10px] text-slate-400 font-mono">{fx.pair}</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{fx.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ECI Discharge Ports Congestion & Waiting Queue Matrix */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">East Coast of India (ECI) Discharge Port Telemetry</h3>
              <p className="text-[11px] text-slate-400">Live draft limits, berth wait times, congestion status, and stockyard capacity</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 pl-2">Port Name & State</th>
                <th className="pb-2">Max Draft</th>
                <th className="pb-2">Max DWT</th>
                <th className="pb-2">Avg Wait Time</th>
                <th className="pb-2">Congestion Level</th>
                <th className="pb-2">Stockyard Utilization</th>
                <th className="pb-2">Demurrage Tariff</th>
                <th className="pb-2 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {ECI_PORTS_DATA.map(port => {
                const utilPct = Math.round((port.currentStockMT / port.stockyardCapacityMT) * 100);
                const congestionBadge =
                  port.currentCongestionLevel === 'Severe'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : port.currentCongestionLevel === 'High'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : port.currentCongestionLevel === 'Moderate'
                    ? 'bg-sky-950 text-sky-300 border-sky-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800';

                return (
                  <tr key={port.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-2.5 pl-2 font-semibold text-slate-200">
                      <div>{port.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{port.state} • {port.berthsCount} Berths</div>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{port.maxDraft} m</td>
                    <td className="py-2.5 font-mono text-slate-300">{(port.maxDWT / 1000).toFixed(0)}k MT</td>
                    <td className="py-2.5 font-mono font-bold text-white">{port.averageBerthWaitHours} hrs</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${congestionBadge}`}>
                        {port.currentCongestionLevel}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="w-28 bg-navy-950 rounded-full h-2 border border-navy-800 overflow-hidden">
                        <div
                          className={`h-full ${utilPct > 80 ? 'bg-rose-500' : utilPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, utilPct)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{utilPct}% ({(port.currentStockMT / 1000).toFixed(0)}k MT)</span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">${port.demurrageRatePerDayUSD.toLocaleString()}/day</td>
                    <td className="py-2.5 pr-2 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Operational
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
