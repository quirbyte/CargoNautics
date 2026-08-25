import React from 'react';
import {
  TrendingUp,
  LineChart,
  Ship,
  Boxes,
  Calculator,
  MapPin,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  Database,
  Anchor
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab =
  | 'overview'
  | 'forecast'
  | 'charter'
  | 'procurement'
  | 'landed-cost'
  | 'map'
  | 'alerts'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingApprovalsCount: number;
  unreadAlertsCount: number;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
  unreadAlertsCount,
  currentRole,
}) => {
  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Market Intelligence',
      sublabel: 'Indices & Bunker Feeds',
      icon: TrendingUp,
      badge: null,
      color: 'text-sky-400',
    },
    {
      id: 'forecast' as ActiveTab,
      label: 'Freight Forecasting',
      sublabel: 'Time-Series & ML Ensembles',
      icon: LineChart,
      badge: 'P10-P90',
      color: 'text-emerald-400',
    },
    {
      id: 'charter' as ActiveTab,
      label: 'Charter Optimizer',
      sublabel: 'Voyage / TC / COA Ranking',
      icon: Ship,
      badge: null,
      color: 'text-cyan-400',
    },
    {
      id: 'procurement' as ActiveTab,
      label: 'Cargo & Stockyard',
      sublabel: 'Procurement & Capacity',
      icon: Boxes,
      badge: null,
      color: 'text-amber-400',
    },
    {
      id: 'landed-cost' as ActiveTab,
      label: 'Landed Cost Simulator',
      sublabel: 'Multi-Origin & What-If',
      icon: Calculator,
      badge: 'INR / MT',
      color: 'text-purple-400',
    },
    {
      id: 'map' as ActiveTab,
      label: 'Maritime Route GIS',
      sublabel: 'AIS Live Vessel Tracker',
      icon: MapPin,
      badge: 'Live AIS',
      color: 'text-blue-400',
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Risk & Congestion',
      sublabel: 'Volatility & Queue Alerts',
      icon: AlertTriangle,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount.toString() : null,
      badgeColor: 'bg-rose-600 text-white',
      color: 'text-rose-400',
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Approval & Audit Trail',
      sublabel: 'Operations Sign-off & Logs',
      icon: ClipboardCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null,
      badgeColor: 'bg-amber-500 text-navy-950 font-bold',
      color: 'text-teal-400',
    },
  ];

  return (
    <aside className="w-64 bg-navy-900/95 border-r border-navy-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-85px)] select-none">
      <div className="p-3 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Decision Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-gradient-to-r from-sky-950/90 to-navy-800 text-white border border-sky-500/40 shadow-lg shadow-sky-950/40'
                  : 'text-slate-300 hover:bg-navy-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-navy-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-navy-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className={`text-xs font-semibold truncate ${isActive ? 'text-sky-300' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-1 ${
                    item.badgeColor || 'bg-navy-800 text-slate-300 border border-navy-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User & System Status Card */}
      <div className="p-3 border-t border-navy-800/80 bg-navy-950/50 m-2 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-sky-400">
            <Anchor className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-slate-200 truncate">ECI Shipping Desk</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              All 8 Ports Tracked
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
