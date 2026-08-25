import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { MarketOverview } from './components/MarketOverview';
import { FreightForecastModule } from './components/FreightForecastModule';
import { CharterOptimizerModule } from './components/CharterOptimizerModule';
import { ProcurementSchedulerModule } from './components/ProcurementSchedulerModule';
import { LandedCostModule } from './components/LandedCostModule';
import { MaritimeMapModule } from './components/MaritimeMapModule';
import { AlertsRiskModule } from './components/AlertsRiskModule';
import { ApprovalAuditModule } from './components/ApprovalAuditModule';
import { ExportModal } from './components/ExportModal';

import {
  UserRole,
  MarketIndexItem,
  BunkerPriceItem,
  FXRateItem,
  AlertItem,
  CharterRecommendation,
  AuditLogEntry,
  VesselClassName,
  CargoLot
} from './types';

import {
  INITIAL_MARKET_INDICES,
  INITIAL_BUNKER_PRICES,
  INITIAL_FX_RATES,
  INITIAL_ALERTS
} from './data/marketData';
import { generateCharterRecommendation } from './engine/charterOptimizer';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('Chartering Analyst');

  // Shared Core State
  const [marketIndices, setMarketIndices] = useState<MarketIndexItem[]>(INITIAL_MARKET_INDICES);
  const [bunkerPrices, setBunkerPrices] = useState<BunkerPriceItem[]>(INITIAL_BUNKER_PRICES);
  const [fxRates, setFxRates] = useState<FXRateItem[]>(INITIAL_FX_RATES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Initial Charter Recommendation Sample
  const initialReco = generateCharterRecommendation('ROUTE-AU-PARADIP', 'Capesize', 150000);
  const [recommendations, setRecommendations] = useState<CharterRecommendation[]>([initialReco]);

  // Initial Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-001',
      timestamp: '2026-08-25 14:15:20',
      user: 'Rahul Sengupta',
      userRole: 'Chartering Analyst',
      action: 'TRIGGERED_RECALIBRATION',
      targetId: 'MODEL-HYBRID-v1.4',
      details: 'Calibrated Capesize neural ensemble weights with recent Pilbara iron ore spot fixtures.',
      rationale: 'High volatility in BCI (+22.4% 30d) required model recalibration.'
    },
    {
      id: 'AUD-002',
      timestamp: '2026-08-25 11:30:10',
      user: 'Amitabh Verma',
      userRole: 'Operations Manager',
      action: 'APPROVED_RECOMMENDATION',
      targetId: 'REC-081204',
      details: 'Approved Voyage Charter fixture for MV Ocean Stalwart at Paradip Port.',
      rationale: 'Pre-monsoon replenishment quota verified with plant stockyard team.'
    }
  ]);

  // Inter-module Context Transition State
  const [optimizerRouteContext, setOptimizerRouteContext] = useState<{
    routeId: string;
    vesselClass: VesselClassName;
  }>({
    routeId: 'ROUTE-AU-PARADIP',
    vesselClass: 'Capesize',
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
  };

  const handleSubmitRecommendationForApproval = (reco: CharterRecommendation) => {
    setRecommendations([reco, ...recommendations]);
    
    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentRole === 'Chartering Analyst' ? 'Analyst Desk' : 'Procurement Lead',
      userRole: currentRole,
      action: 'TRIGGERED_RECALIBRATION',
      targetId: reco.id,
      details: `Generated new ${reco.recommendedCharterType} recommendation for ${reco.routeId} (${(reco.cargoQuantityMT/1000).toFixed(0)}k MT).`,
      rationale: reco.rationale[0],
    };
    setAuditLogs([newLog, ...auditLogs]);

    setActiveTab('audit');
  };

  const handleApproveRecommendation = (recoId: string, notes?: string) => {
    setRecommendations(recommendations.map(r => {
      if (r.id === recoId) {
        return {
          ...r,
          status: 'Approved',
          approvedBy: `${currentRole} (Signed)`,
          approvalTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          overrideNotes: notes,
        };
      }
      return r;
    }));

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Operations Sign-off Lead',
      userRole: currentRole,
      action: 'APPROVED_RECOMMENDATION',
      targetId: recoId,
      details: `Approved fixture recommendation ${recoId}`,
      rationale: notes || 'Approved in accordance with procurement volume targets.',
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleOverrideRecommendation = (recoId: string, overrideNotes: string) => {
    setRecommendations(recommendations.map(r => {
      if (r.id === recoId) {
        return {
          ...r,
          status: 'Overridden',
          approvedBy: `${currentRole} (Overridden)`,
          approvalTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          overrideNotes,
        };
      }
      return r;
    }));

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Operations Sign-off Lead',
      userRole: currentRole,
      action: 'OVERRODE_RECOMMENDATION',
      targetId: recoId,
      details: `Overrode default recommendation ${recoId}`,
      rationale: overrideNotes,
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSelectRouteForCharter = (routeId: string, vesselClass: VesselClassName) => {
    setOptimizerRouteContext({ routeId, vesselClass });
    setActiveTab('charter');
  };

  const handlePlanCharterForLot = (lot: CargoLot) => {
    setOptimizerRouteContext({
      routeId: 'ROUTE-AU-PARADIP',
      vesselClass: lot.quantityMT >= 120000 ? 'Capesize' : lot.quantityMT >= 70000 ? 'Panamax' : 'Supramax',
    });
    setActiveTab('charter');
  };

  const pendingApprovalsCount = recommendations.filter(r => r.status === 'Pending Review').length;
  const unreadAlertsCount = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        marketIndices={marketIndices}
        bunkerPrices={bunkerPrices}
        fxRates={fxRates}
        alerts={alerts}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingApprovalsCount={pendingApprovalsCount}
          unreadAlertsCount={unreadAlertsCount}
          currentRole={currentRole}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <MarketOverview
              marketIndices={marketIndices}
              bunkerPrices={bunkerPrices}
              fxRates={fxRates}
              onTriggerForecast={() => setActiveTab('forecast')}
            />
          )}

          {activeTab === 'forecast' && (
            <FreightForecastModule
              onSelectRouteForCharter={handleSelectRouteForCharter}
            />
          )}

          {activeTab === 'charter' && (
            <CharterOptimizerModule
              initialRouteId={optimizerRouteContext.routeId}
              initialVesselClass={optimizerRouteContext.vesselClass}
              currentRole={currentRole}
              onSubmitRecommendationForApproval={handleSubmitRecommendationForApproval}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementSchedulerModule
              onPlanCharterForLot={handlePlanCharterForLot}
            />
          )}

          {activeTab === 'landed-cost' && (
            <LandedCostModule />
          )}

          {activeTab === 'map' && (
            <MaritimeMapModule />
          )}

          {activeTab === 'alerts' && (
            <AlertsRiskModule
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {activeTab === 'audit' && (
            <ApprovalAuditModule
              currentRole={currentRole}
              recommendations={recommendations}
              auditLogs={auditLogs}
              onApproveRecommendation={handleApproveRecommendation}
              onOverrideRecommendation={handleOverrideRecommendation}
            />
          )}
        </main>
      </div>

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeRecommendation={recommendations[0]}
      />
    </div>
  );
};
