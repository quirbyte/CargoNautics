import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  CheckCircle2,
  Send,
  Sliders,
  Radio,
  Clock,
  Flame,
  Ship,
  Warehouse,
  Check
} from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsRiskModuleProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
}

export const AlertsRiskModule: React.FC<AlertsRiskModuleProps> = ({
  alerts,
  onAcknowledgeAlert,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [volatilityThresholdPct, setVolatilityThresholdPct] = useState<number>(8.0);
  const [congestionThresholdHours, setCongestionThresholdHours] = useState<number>(36);
  const [stockyardThresholdPct, setStockyardThresholdPct] = useState<number>(80);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const handleTestBroadcast = (channel: string) => {
    setDispatchedSuccess(`Alert broadcast successfully dispatched to ${channel} webhook.`);
    setTimeout(() => setDispatchedSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Risk Monitoring & Early-Warning Alerts</h2>
            <span className="bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              24/7 Automated Sentinel
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time triggers for freight rate spikes, ECI port congestion queues, laycan cancelling risks, and stockyard overflow buffers.
          </p>
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-navy-900 border border-navy-700 p-1 rounded-xl text-xs">
          {['ALL', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                selectedSeverity === sev
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatched Notification Banner */}
      {dispatchedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{dispatchedSuccess}</span>
        </div>
      )}

      {/* Alert Feed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Risk Alerts ({filteredAlerts.length})
            </span>
            <span className="text-[11px] text-slate-500">Live Webhook Connected</span>
          </div>

          {filteredAlerts.map((alert) => {
            const severityBadge =
              alert.severity === 'Critical'
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : alert.severity === 'High'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-sky-950 text-sky-300 border-sky-700';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.isAcknowledged
                    ? 'glass-panel bg-navy-950/40 border-navy-800 opacity-70'
                    : 'glass-panel-glow border-rose-500/30 bg-navy-900/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border mt-0.5 ${severityBadge}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alert.title}</span>
                        <span className={`px-2 py-0.2 rounded-full border text-[9px] font-bold ${severityBadge}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono mt-2">
                        <span>Triggered: {alert.triggeredAt}</span>
                        {alert.metricDelta && <span className="text-amber-400 font-bold">Delta: {alert.metricDelta}</span>}
                        {alert.routeOrPort && <span className="text-sky-400">Target: {alert.routeOrPort}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!alert.isAcknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 rounded-lg bg-navy-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-semibold transition border border-navy-700 hover:border-emerald-500 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alert Threshold Settings & Webhook Simulation */}
        <div className="space-y-5">
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Alert Threshold Rules</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Freight Volatility Alert</span>
                  <span className="font-mono font-bold text-amber-400">±{volatilityThresholdPct}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="0.5"
                  value={volatilityThresholdPct}
                  onChange={(e) => setVolatilityThresholdPct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Port Wait Time Alert</span>
                  <span className="font-mono font-bold text-rose-400">&gt; {congestionThresholdHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="2"
                  value={congestionThresholdHours}
                  onChange={(e) => setCongestionThresholdHours(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Stockyard Overflow Buffer</span>
                  <span className="font-mono font-bold text-sky-400">&gt; {stockyardThresholdPct}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={stockyardThresholdPct}
                  onChange={(e) => setStockyardThresholdPct(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Multi-Channel Webhook Dispatcher Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
              <Send className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Multi-Channel Webhook Broadcast</h3>
            </div>

            <p className="text-xs text-slate-400">
              Simulate dispatching urgent freight volatility or port congestion alerts to enterprise channels:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleTestBroadcast('Corporate Microsoft Teams')}
                className="w-full py-2 px-3 rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-700 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
              >
                <span>Microsoft Teams (#chartering-alerts)</span>
                <Send className="w-3 h-3 text-sky-400" />
              </button>

              <button
                onClick={() => handleTestBroadcast('Procurement Slack Gateway')}
                className="w-full py-2 px-3 rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-700 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
              >
                <span>Slack (#bulk-cargo-procurement)</span>
                <Send className="w-3 h-3 text-purple-400" />
              </button>

              <button
                onClick={() => handleTestBroadcast('Executive Email Digest (SMTP/SendGrid)')}
                className="w-full py-2 px-3 rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-700 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
              >
                <span>Executive Email Notification Digest</span>
                <Send className="w-3 h-3 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
