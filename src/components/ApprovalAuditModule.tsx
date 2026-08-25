import React, { useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  User,
  History,
  AlertCircle,
  Download,
  Award
} from 'lucide-react';
import { CharterRecommendation, AuditLogEntry, UserRole } from '../types';
import { exportCharterMemoPDF } from '../utils/exportUtils';

interface ApprovalAuditModuleProps {
  currentRole: UserRole;
  recommendations: CharterRecommendation[];
  auditLogs: AuditLogEntry[];
  onApproveRecommendation: (recoId: string, notes?: string) => void;
  onOverrideRecommendation: (recoId: string, overrideNotes: string) => void;
}

export const ApprovalAuditModule: React.FC<ApprovalAuditModuleProps> = ({
  currentRole,
  recommendations,
  auditLogs,
  onApproveRecommendation,
  onOverrideRecommendation,
}) => {
  const [selectedRecoForAction, setSelectedRecoForAction] = useState<CharterRecommendation | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'OVERRIDE'>('APPROVE');
  const [actionNotes, setActionNotes] = useState<string>('');

  const isManagerOrAdmin = currentRole === 'Operations Manager' || currentRole === 'System Administrator';

  const handleConfirmAction = () => {
    if (!selectedRecoForAction) return;

    if (actionType === 'APPROVE') {
      onApproveRecommendation(selectedRecoForAction.id, actionNotes);
    } else {
      onOverrideRecommendation(selectedRecoForAction.id, actionNotes);
    }

    setSelectedRecoForAction(null);
    setActionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Charter Approval Workflow & Audit Trail</h2>
            <span className="bg-teal-950 text-teal-400 border border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Governance & Compliance
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Operations Manager sign-off workflow, decision rationale logging, and immutable audit trails for vessel fixtures and procurement commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-xs">
          <User className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400 font-semibold">Your Role:</span>
          <span className="font-bold text-sky-300">{currentRole}</span>
        </div>
      </div>

      {/* Pending Recommendations Section */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Chartering Recommendations Awaiting Sign-off</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {recommendations.length} Total Submissions
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((reco) => {
            const topVessel = reco.rankedVessels[0];
            const isPending = reco.status === 'Pending Review';

            return (
              <div
                key={reco.id}
                className="p-4 rounded-2xl bg-navy-950/60 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-navy-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{reco.id}</span>
                    <span className="text-xs font-bold text-sky-300">({reco.routeId})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      reco.status === 'Approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : reco.status === 'Overridden'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {reco.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Strategy: <strong className="text-white">{reco.recommendedCharterType}</strong></span>
                    <span>Vessel Class: <strong className="text-white">{reco.vesselClass}</strong></span>
                    <span>Quantity: <strong className="text-white font-mono">{(reco.cargoQuantityMT / 1000).toFixed(0)}k MT</strong></span>
                    <span>Laycan: <strong className="text-white font-mono">{reco.recommendedLaycanWindow.start} to {reco.recommendedLaycanWindow.end}</strong></span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Top Vessel: <strong className="text-sky-300">{topVessel?.name || 'MV Cape Candidate'}</strong> (RightShip: {topVessel?.vettingScore || 4.8}/5)</span>
                    <span>• Freight: <strong className="text-emerald-400 font-mono">${reco.expectedFreightRateUSDperMT.toFixed(2)}/MT</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Export PDF Memo */}
                  <button
                    onClick={() => exportCharterMemoPDF(reco)}
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-xs font-semibold transition flex items-center gap-1.5"
                    title="Download Official PDF Memo"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>PDF Memo</span>
                  </button>

                  {/* Actions for Operations Manager / Admin */}
                  {isPending && isManagerOrAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRecoForAction(reco);
                          setActionType('APPROVE');
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRecoForAction(reco);
                          setActionType('OVERRIDE');
                        }}
                        className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition shadow-md flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Override</span>
                      </button>
                    </>
                  )}

                  {isPending && !isManagerOrAdmin && (
                    <span className="text-[11px] text-amber-400 italic">
                      Awaiting Manager Role
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Audit Trail Log */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Immutable Decision & Recommendation Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Logged Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 pl-2">Timestamp (GMT)</th>
                <th className="pb-2">User & Role</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Target ID</th>
                <th className="pb-2 pr-2">Decision Details & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-800/40 transition">
                  <td className="py-3 pl-2 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 font-sans">
                    <div className="font-bold text-slate-200">{log.user}</div>
                    <div className="text-[10px] text-sky-400">{log.userRole}</div>
                  </td>
                  <td className="py-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'APPROVED_RECOMMENDATION'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.action === 'OVERRODE_RECOMMENDATION'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-sky-950 text-sky-400 border border-sky-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">{log.targetId}</td>
                  <td className="py-3 pr-2 font-sans text-slate-300">
                    <div>{log.details}</div>
                    {log.rationale && (
                      <div className="text-[11px] text-amber-300 italic mt-0.5">
                        &quot;{log.rationale}&quot;
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval / Override Modal */}
      {selectedRecoForAction && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-purple-400" />
                )}
                <span>
                  {actionType === 'APPROVE' ? 'Approve Charter Recommendation' : 'Override Recommendation Strategy'}
                </span>
              </h3>
              <button
                onClick={() => setSelectedRecoForAction(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-300">
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
                <div>Recommendation ID: <strong className="text-white font-mono">{selectedRecoForAction.id}</strong></div>
                <div>Route: <strong className="text-white">{selectedRecoForAction.routeId}</strong></div>
                <div>Proposed Strategy: <strong className="text-sky-300">{selectedRecoForAction.recommendedCharterType}</strong></div>
                <div>Expected Rate: <strong className="text-emerald-400 font-mono">${selectedRecoForAction.expectedFreightRateUSDperMT.toFixed(2)}/MT</strong></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {actionType === 'APPROVE' ? 'Approval Notes / Authorization Rationale' : 'Mandatory Override Reason'}
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionType === 'APPROVE' ? 'e.g., Approved based on Q3 freight forecast and stockyard slot availability.' : 'e.g., Shifted to Time Charter to hedge against anticipated Q4 rally.'}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setSelectedRecoForAction(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/40'
                }`}
              >
                Confirm {actionType === 'APPROVE' ? 'Sign-off' : 'Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
