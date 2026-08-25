// Domain Types & Interfaces matching IEEE 29148 / 830 SRS specifications for IFFM (Nautical AI)

export type UserRole = 'Chartering Analyst' | 'Procurement Planner' | 'Operations Manager' | 'Executive Viewer' | 'System Administrator';

export type VesselClassName = 'Capesize' | 'Post-Panamax' | 'Kamsarmax' | 'Panamax' | 'Supramax' | 'Handysize';

export type CharterType = 'Voyage Charter' | 'Time Charter' | 'COA';

export type ForecastHorizon = '7d' | '30d' | '90d' | '180d';

export type ModelAlgorithm = 'ARIMA_TIME_SERIES' | 'GRADIENT_BOOSTED_ML' | 'HYBRID_ENSEMBLE';

export interface Route {
  id: string;
  name: string;
  loadPort: string;
  loadCountry: string;
  dischargePort: string;
  dischargeRegion: string; // e.g. "East Coast India (ECI)"
  distanceNM: number;
  typicalVoyageDays: number;
  canalTransit?: 'Suez' | 'Panama' | 'Cape of Good Hope' | 'Direct';
  maxDraftDischarge: number; // meters
  allowedVesselClasses: VesselClassName[];
  primaryCommodities: string[];
  coordinates: {
    load: [number, number]; // [lat, lng]
    discharge: [number, number]; // [lat, lng]
    waypoints: [number, number][];
  };
}

export interface PortData {
  id: string;
  name: string;
  state: string;
  maxDraft: number; // meters
  maxDWT: number; // MT
  berthsCount: number;
  averageBerthWaitHours: number;
  currentCongestionLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  stockyardCapacityMT: number;
  currentStockMT: number;
  dailyEvacuationRateMT: number;
  portTariffUSDperMT: number;
  stevedoringUSDperMT: number;
  demurrageRatePerDayUSD: number;
  despatchRatePerDayUSD: number;
  coordinates: [number, number];
}

export interface VesselCandidate {
  id: string;
  name: string;
  vesselClass: VesselClassName;
  dwt: number;
  builtYear: number;
  flag: string;
  vettingScore: number; // RightShip score 1-5 (5 is best)
  dailyHireRateUSD: number;
  fuelConsumptionTonsPerDay: number; // VLSFO consumption laden
  ecoSpeedKnots: number;
  currentLocation: string;
  currentCoordinates: [number, number];
  destinationPort: string;
  etaDays: number;
  laycanReadyDate: string;
  isAvailable: boolean;
  ownerRating: 'Tier 1 Global' | 'Tier 2 Reputable' | 'Spot Trader';
  ghgRating: 'A' | 'B' | 'C' | 'D';
}

export interface MarketIndexItem {
  code: string;
  name: string;
  value: number;
  change1d: number;
  change1dPct: number;
  change30dPct: number;
  high52w: number;
  low52w: number;
  historical: { date: string; value: number }[];
  isStale: boolean;
  lastUpdated: string;
}

export interface BunkerPriceItem {
  port: string;
  vlsfoUSD: number;
  mgoUSD: number;
  changeVlsfo: number;
  changeMgo: number;
  lastUpdated: string;
}

export interface FXRateItem {
  pair: string;
  rate: number;
  change1d: number;
  lastUpdated: string;
}

export interface ForecastDriver {
  name: string;
  impactUSDperMT: number;
  category: 'Bunker' | 'Supply' | 'Demand' | 'Weather' | 'Congestion' | 'Macro';
  description: string;
}

export interface ForecastPoint {
  date: string;
  predictedRate: number; // USD / MT
  confidenceLow: number; // P10
  confidenceHigh: number; // P90
  historicalActual?: number;
}

export interface FreightForecast {
  id: string;
  routeId: string;
  vesselClass: VesselClassName;
  horizon: ForecastHorizon;
  algorithm: ModelAlgorithm;
  predictedRateUSDperMT: number;
  currentSpotRateUSDperMT: number;
  changeVsSpotPct: number;
  confidenceLowP10: number;
  confidenceHighP90: number;
  forecastDate: string;
  horizonDate: string;
  mapeScore: number;
  rmseScore: number;
  drivers: ForecastDriver[];
  timeSeriesData: ForecastPoint[];
  recommendationSummary: string;
}

export interface CharterStrategyEvaluation {
  charterType: CharterType;
  expectedCostUSDperMT: number;
  totalCostUSD: number;
  riskScore: number; // 0-100 (lower is better)
  breakEvenThresholdDays: number;
  suitabilityScore: number; // 0-100 (higher is better)
  pros: string[];
  cons: string[];
  isRecommended: boolean;
}

export interface CharterRecommendation {
  id: string;
  cargoLotId?: string;
  routeId: string;
  vesselClass: VesselClassName;
  cargoQuantityMT: number;
  recommendedCharterType: CharterType;
  recommendedLaycanWindow: {
    start: string;
    end: string;
    optimalFixtureDate: string;
  };
  expectedFreightRateUSDperMT: number;
  expectedTotalFreightUSD: number;
  expectedDemurrageRiskUSD: number;
  expectedDespatchBenefitUSD: number;
  netShippingCostUSDperMT: number;
  rankedVessels: (VesselCandidate & {
    totalEvaluatedCostUSD: number;
    costPerMTUSD: number;
    laycanCompliance: 'Optimal' | 'Tight' | 'Risky';
    compositeRankScore: number;
  })[];
  rationale: string[];
  status: 'Pending Review' | 'Approved' | 'Overridden' | 'Rejected';
  approvedBy?: string;
  approvalTimestamp?: string;
  overrideNotes?: string;
}

export interface CargoLot {
  id: string;
  lotReference: string;
  commodity: 'Coking Coal' | 'Thermal Coal' | 'Iron Ore' | 'Limestone' | 'Petcoke' | 'Grain / Fertilizer';
  quantityMT: number;
  tolerancePct: number; // e.g. 10% MOLOO
  originPort: string;
  originCountry: string;
  dischargePort: string;
  requiredDeliveryWindow: {
    earliest: string;
    latest: string;
  };
  fobPriceUSDperMT: number;
  assignedVesselId?: string;
  assignedLaycan?: string;
  status: 'Unassigned' | 'Charter Proposed' | 'Scheduled' | 'In Transit' | 'Discharged';
}

export interface LandedCostBreakdown {
  cargoPriceUSDperMT: number;
  oceanFreightUSDperMT: number;
  marineInsuranceUSDperMT: number;
  portTariffsUSDperMT: number;
  stevedoringUSDperMT: number;
  demurrageRiskUSDperMT: number;
  despatchBenefitUSDperMT: number;
  totalLandedCostUSDperMT: number;
  usdInrRate: number;
  totalLandedCostINRperMT: number;
  totalLandedCostTotalINR: number;
}

export interface OriginComparisonItem {
  originName: string;
  originCountry: string;
  loadPort: string;
  dischargePort: string;
  transitDays: number;
  fobPriceUSDperMT: number;
  freightUSDperMT: number;
  insuranceUSDperMT: number;
  portChargesUSDperMT: number;
  demurrageRiskUSDperMT: number;
  landedCostUSDperMT: number;
  landedCostINRperMT: number;
  qualityCV_kcal?: number;
  qualityAsh_pct?: number;
  costPerGCV_INR?: number; // Normalized cost per GCV
  isCheapest: boolean;
}

export interface StockyardSimulationDay {
  dayIndex: number;
  date: string;
  openingStockMT: number;
  arrivalsMT: number;
  arrivingVessels: string[];
  dailyConsumptionMT: number;
  closingStockMT: number;
  capacityUtilizationPct: number;
  isOverflowRisk: boolean;
  isStockoutRisk: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  type: 'FREIGHT_VOLATILITY' | 'LAYCAN_RISK' | 'PORT_CONGESTION' | 'STOCKYARD_CAPACITY' | 'WEATHER_DISRUPTION' | 'FEED_ANOMALY';
  severity: 'Critical' | 'High' | 'Medium' | 'Info';
  message: string;
  triggeredAt: string;
  routeOrPort?: string;
  metricDelta?: string;
  isAcknowledged: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: 'APPROVED_RECOMMENDATION' | 'OVERRODE_RECOMMENDATION' | 'TRIGGERED_RECALIBRATION' | 'MODIFIED_SCENARIO' | 'DISPATCHED_ALERT';
  targetId: string;
  details: string;
  previousState?: string;
  newState?: string;
  rationale?: string;
}
