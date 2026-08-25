import React, { useState } from 'react';
import {
  Compass,
  Bell,
  User,
  ShieldCheck,
  TrendingUp,
  Flame,
  Globe,
  Radio,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { UserRole, MarketIndexItem, BunkerPriceItem, FXRateItem, AlertItem } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  marketIndices: MarketIndexItem[];
  bunkerPrices: BunkerPriceItem[];
  fxRates: FXRateItem[];
  alerts: AlertItem[];
  onOpenAlerts: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  marketIndices,
  bunkerPrices,
  fxRates,
  alerts,
  onOpenAlerts,
  onOpenExportModal
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const unreadAlertsCount = alerts.filter(a => !a.isAcknowledged).length;

  const roles: UserRole[] = [
    'Chartering Analyst',
    'Procurement Planner',
    'Operations Manager',
    'Executive Viewer',
    'System Administrator'
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 shadow-lg">
      {/* Top Ticker Ribbon */}
      <div className="bg-navy-950/80 px-4 py-1.5 border-b border-navy-800/60 flex items-center justify-between text-xs overflow-x-auto gap-6">
        <div className="flex items-center gap-2 font-semibold text-sky-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse"></span>
          <span className="tracking-wider uppercase text-[11px]">LIVE MARITIME FEEDS</span>
        </div>

        <div className="flex items-center gap-6 text-slate-300 overflow-x-auto py-0.5 whitespace-nowrap">
          {marketIndices.map(idx => (
            <div key={idx.code} className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-semibold">{idx.code}:</span>
              <span className="font-bold text-white">{idx.value.toLocaleString()}</span>
              <span className={`text-[10px] px-1 rounded ${idx.change1d >= 0 ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400'}`}>
                {idx.change1d >= 0 ? '▲' : '▼'} {Math.abs(idx.change1dPct)}%
              </span>
            </div>
          ))}

          <div className="h-3 w-px bg-navy-800"></div>

          {/* Singapore Bunker */}
          {bunkerPrices.slice(0, 1).map(bp => (
            <div key={bp.port} className="flex items-center gap-1.5 font-mono">
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">VLSFO ({bp.port}):</span>
              <span className="font-bold text-white">${bp.vlsfoUSD.toFixed(1)}</span>
              <span className={`text-[10px] ${bp.changeVlsfo >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ({bp.changeVlsfo >= 0 ? '+' : ''}${bp.changeVlsfo})
              </span>
            </div>
          ))}

          <div className="h-3 w-px bg-navy-800"></div>

          {/* FX USD/INR */}
          {fxRates.slice(0, 1).map(fx => (
            <div key={fx.pair} className="flex items-center gap-1.5 font-mono">
              <Globe className="w-3 h-3 text-sky-400" />
              <span className="text-slate-400">{fx.pair}:</span>
              <span className="font-bold text-white">₹{fx.rate.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Sync: 25 Aug 2026 14:30 GMT</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Cargo <span className="text-sky-400 font-extrabold">NAUTICS</span>
              </h1>
              <span className="bg-sky-950 text-sky-300 border border-sky-800/80 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                IFFM v1.0 • IEEE 29148
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Freight Forecasting & Vessel Chartering Optimizer (Overseas → East Coast India)
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Export Report Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold transition shadow-sm hover:border-sky-500/40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Brief</span>
          </button>

          {/* Notifications Alert Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition"
            title="Risk Alerts & Congestion Monitor"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800/90 hover:bg-navy-700/90 border border-sky-500/30 text-xs font-medium text-slate-200 transition shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-sky-600/30 border border-sky-400 flex items-center justify-center text-sky-300">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Role</div>
                <div className="font-bold text-sky-300 leading-none">{currentRole}</div>
              </div>
              <span className="text-slate-400 text-[10px] ml-1">▼</span>
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-navy-800 tracking-wider">
                  Select User Perspective
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                      currentRole === r
                        ? 'bg-sky-950/80 text-sky-300 font-semibold border-l-2 border-sky-400'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
