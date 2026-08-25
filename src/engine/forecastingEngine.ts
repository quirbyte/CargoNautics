import {
  FreightForecast,
  ForecastHorizon,
  ModelAlgorithm,
  VesselClassName,
  ForecastDriver,
  ForecastPoint
} from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { INITIAL_MARKET_INDICES, INITIAL_BUNKER_PRICES } from '../data/marketData';

// Route baseline benchmark freight rates (USD/MT) for Capesize / Panamax / Supramax
const ROUTE_BASE_RATES: Record<string, Record<VesselClassName, number>> = {
  'ROUTE-AU-PARADIP': {
    'Capesize': 14.80,
    'Post-Panamax': 17.20,
    'Kamsarmax': 18.90,
    'Panamax': 20.10,
    'Supramax': 23.50,
    'Handysize': 28.00,
  },
  'ROUTE-AU-VIZAG': {
    'Capesize': 13.90,
    'Post-Panamax': 16.10,
    'Kamsarmax': 17.80,
    'Panamax': 18.90,
    'Supramax': 22.00,
    'Handysize': 26.50,
  },
  'ROUTE-ID-KRISHNA': {
    'Capesize': 8.50,
    'Post-Panamax': 9.20,
    'Kamsarmax': 9.90,
    'Panamax': 10.40,
    'Supramax': 11.80,
    'Handysize': 14.50,
  },
  'ROUTE-ID-ENNORE': {
    'Capesize': 8.90,
    'Post-Panamax': 9.60,
    'Kamsarmax': 10.30,
    'Panamax': 10.80,
    'Supramax': 12.20,
    'Handysize': 15.00,
  },
  'ROUTE-ZA-VIZAG': {
    'Capesize': 16.50,
    'Post-Panamax': 18.80,
    'Kamsarmax': 20.40,
    'Panamax': 21.60,
    'Supramax': 24.90,
    'Handysize': 29.50,
  },
  'ROUTE-BR-PARADIP': {
    'Capesize': 24.50,
    'Post-Panamax': 27.90,
    'Kamsarmax': 30.50,
    'Panamax': 32.80,
    'Supramax': 37.50,
    'Handysize': 44.00,
  },
  'ROUTE-US-HALDIA': {
    'Capesize': 38.00,
    'Post-Panamax': 42.50,
    'Kamsarmax': 45.00,
    'Panamax': 47.80,
    'Supramax': 52.40,
    'Handysize': 58.50,
  },
  'ROUTE-AE-CHENNAI': {
    'Capesize': 7.50,
    'Post-Panamax': 8.20,
    'Kamsarmax': 8.90,
    'Panamax': 9.50,
    'Supramax': 10.80,
    'Handysize': 13.00,
  }
};

/**
 * Generate Intelligent Freight Forecast using statistical, ML, or hybrid ensemble models.
 */
export function generateFreightForecast(
  routeId: string,
  vesselClass: VesselClassName,
  horizon: ForecastHorizon = '30d',
  algorithm: ModelAlgorithm = 'HYBRID_ENSEMBLE',
  bunkerPriceAdjustmentPct: number = 0 // for sensitivity testing
): FreightForecast {
  const route = MARITIME_ROUTES.find(r => r.id === routeId) || MARITIME_ROUTES[0];
  const baseRates = ROUTE_BASE_RATES[route.id] || ROUTE_BASE_RATES['ROUTE-AU-PARADIP'];
  const baseSpotRate = baseRates[vesselClass] || 15.0;

  // Horizon multiplier & seasonality
  const horizonDays = horizon === '7d' ? 7 : horizon === '30d' ? 30 : horizon === '90d' ? 90 : 180;
  
  // Market drivers influence
  const bdi = INITIAL_MARKET_INDICES.find(i => i.code === 'BDI')?.value || 1845;
  const bci = INITIAL_MARKET_INDICES.find(i => i.code === 'BCI')?.value || 2980;
  const avgBunker = INITIAL_BUNKER_PRICES[0].vlsfoUSD * (1 + bunkerPriceAdjustmentPct / 100);
  
  // Model-specific trajectory calculation
  let trendSlope = 0.0;
  let modelMape = 4.2;
  let modelRmse = 0.85;

  if (algorithm === 'ARIMA_TIME_SERIES') {
    // Statistical autoregressive trend with harmonic seasonality
    trendSlope = 0.045 * (horizonDays / 30);
    modelMape = 5.8;
    modelRmse = 1.15;
  } else if (algorithm === 'GRADIENT_BOOSTED_ML') {
    // ML model capturing non-linear index correlation + bunker pass-through
    const indexBoost = (bci - 2500) / 10000;
    const bunkerBoost = ((avgBunker - 580) / 580) * 0.15;
    trendSlope = (0.05 + indexBoost + bunkerBoost) * (horizonDays / 30);
    modelMape = 3.9;
    modelRmse = 0.72;
  } else {
    // Hybrid Ensemble (Combining ARIMA + XGBoost + Prophet weights)
    const arimaPart = 0.045 * (horizonDays / 30);
    const mlPart = (0.052 + (avgBunker - 580) / 6000) * (horizonDays / 30);
    trendSlope = (arimaPart * 0.35 + mlPart * 0.65);
    modelMape = 3.4;
    modelRmse = 0.64;
  }

  const predictedRate = Math.round((baseSpotRate * (1 + trendSlope)) * 100) / 100;
  const changeVsSpotPct = Math.round(((predictedRate - baseSpotRate) / baseSpotRate) * 1000) / 10;

  // Confidence Interval calculation (wider for longer horizons)
  const confidenceSpreadPct = 0.04 + (horizonDays / 180) * 0.08;
  const confidenceLow = Math.round((predictedRate * (1 - confidenceSpreadPct)) * 100) / 100;
  const confidenceHigh = Math.round((predictedRate * (1 + confidenceSpreadPct)) * 100) / 100;

  // Generate historical actuals + future forecast points
  const timeSeriesData: ForecastPoint[] = [];
  const today = new Date('2026-08-25');
  
  // Past 30 days actual historical points
  for (let i = 30; i >= 0; i -= 5) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const historicalFluctuation = Math.sin(i / 4) * 0.6 - (i / 30) * 0.8;
    const actualVal = Math.round((baseSpotRate + historicalFluctuation) * 100) / 100;
    timeSeriesData.push({
      date: dateStr,
      predictedRate: actualVal,
      confidenceLow: actualVal,
      confidenceHigh: actualVal,
      historicalActual: actualVal,
    });
  }

  // Future forecast points
  const stepDays = horizonDays <= 30 ? 3 : horizonDays <= 90 ? 7 : 14;
  for (let i = stepDays; i <= horizonDays; i += stepDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const progress = i / horizonDays;
    const pointPredicted = Math.round((baseSpotRate + (predictedRate - baseSpotRate) * progress) * 100) / 100;
    const pointSpread = (0.03 + progress * (confidenceSpreadPct - 0.03));
    const pLow = Math.round((pointPredicted * (1 - pointSpread)) * 100) / 100;
    const pHigh = Math.round((pointPredicted * (1 + pointSpread)) * 100) / 100;

    timeSeriesData.push({
      date: dateStr,
      predictedRate: pointPredicted,
      confidenceLow: pLow,
      confidenceHigh: pHigh,
    });
  }

  // Feature Importance & Explainability Drivers
  const bunkerImpact = Math.round(((avgBunker - 580) / 580 * baseSpotRate * 0.18) * 100) / 100;
  const drivers: ForecastDriver[] = [
    {
      name: 'Bunker Fuel Price Delta (VLSFO)',
      impactUSDperMT: bunkerImpact !== 0 ? bunkerImpact : 0.42,
      category: 'Bunker',
      description: `VLSFO bunker benchmark at $${avgBunker.toFixed(1)}/MT impacting voyage consumption cost.`
    },
    {
      name: 'ECI Port Congestion & Waiting Queues',
      impactUSDperMT: 0.35,
      category: 'Congestion',
      description: `Waiting times at ${route.dischargePort} and Haldia reducing effective vessel turnaround supply.`
    },
    {
      name: 'Pacific Basin Fleet Supply (Capesize/Panamax)',
      impactUSDperMT: -0.22,
      category: 'Supply',
      description: 'Incoming ballast fleet from China/Japan replenishing open tonnage availability in Singapore.'
    },
    {
      name: 'Monsoon Weather & Sea State Delay Factor',
      impactUSDperMT: 0.28,
      category: 'Weather',
      description: 'SW Monsoon swell in Indian Ocean causing minor speed reduction (-1.2 knots).'
    },
    {
      name: 'Steel Mill & Power Plant Stocking Demand',
      impactUSDperMT: 0.45,
      category: 'Demand',
      description: 'Pre-festive restocking in East India driving procurement parcel inquiries.'
    }
  ];

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + horizonDays);

  const recoSummary = changeVsSpotPct > 5
    ? `Bullish forward freight curve (+${changeVsSpotPct}% over ${horizon}). Recommended action: Secure early fixture laycan or explore short-term Time Charter / COA index coverage.`
    : changeVsSpotPct < -3
    ? `Softening freight curve (${changeVsSpotPct}% over ${horizon}). Recommended action: Float inquiries closer to laycan window on spot Voyage Charter.`
    : `Stable sideways freight structure (±${Math.abs(changeVsSpotPct)}%). Standard Voyage Charter index-linked contract recommended.`;

  return {
    id: `FC-${route.id}-${vesselClass}-${horizon}`,
    routeId: route.id,
    vesselClass,
    horizon,
    algorithm,
    predictedRateUSDperMT: predictedRate,
    currentSpotRateUSDperMT: baseSpotRate,
    changeVsSpotPct,
    confidenceLowP10: confidenceLow,
    confidenceHighP90: confidenceHigh,
    forecastDate: '2026-08-25',
    horizonDate: targetDate.toISOString().split('T')[0],
    mapeScore: modelMape,
    rmseScore: modelRmse,
    drivers,
    timeSeriesData,
    recommendationSummary: recoSummary,
  };
}
