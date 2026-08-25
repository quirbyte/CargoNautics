import {
  LandedCostBreakdown,
  OriginComparisonItem,
  VesselClassName
} from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { ECI_PORTS_DATA } from '../data/portsData';
import { generateFreightForecast } from './forecastingEngine';
import { calculateLaytimeAndDemurrage } from './demurrageEngine';
import { INITIAL_FX_RATES } from '../data/marketData';

export interface LandedCostParams {
  fobPriceUSDperMT: number;
  routeId: string;
  vesselClass: VesselClassName;
  cargoQuantityMT: number;
  bunkerAdjustmentPct?: number;
  usdInrRate?: number;
  insuranceRatePct?: number; // default ~0.35% of CIF
  extraPortDelayDays?: number;
}

/**
 * Calculate total landed cost for bulk cargo procurement.
 */
export function calculateLandedCost(params: LandedCostParams): LandedCostBreakdown {
  const {
    fobPriceUSDperMT,
    routeId,
    vesselClass,
    cargoQuantityMT,
    bunkerAdjustmentPct = 0,
    usdInrRate = INITIAL_FX_RATES[0].rate,
    insuranceRatePct = 0.35,
    extraPortDelayDays = 0,
  } = params;

  const route = MARITIME_ROUTES.find(r => r.id === routeId) || MARITIME_ROUTES[0];
  const port = ECI_PORTS_DATA.find(p => p.name.toLowerCase().includes(route.dischargePort.toLowerCase().split(' ')[0])) || ECI_PORTS_DATA[0];

  const forecast = generateFreightForecast(route.id, vesselClass, '30d', 'HYBRID_ENSEMBLE', bunkerAdjustmentPct);
  const oceanFreightUSDperMT = forecast.predictedRateUSDperMT;

  // CIF Value estimation for insurance
  const estimatedCIF = fobPriceUSDperMT + oceanFreightUSDperMT;
  const marineInsuranceUSDperMT = Math.round((estimatedCIF * (insuranceRatePct / 100)) * 100) / 100;

  const portTariffsUSDperMT = port.portTariffUSDperMT;
  const stevedoringUSDperMT = port.stevedoringUSDperMT;

  // Demurrage & Despatch
  const demurrageCalc = calculateLaytimeAndDemurrage(cargoQuantityMT, port, 25000, 20000, 0.5 + extraPortDelayDays);
  const demurrageRiskUSDperMT = Math.max(0, demurrageCalc.exposurePerMTUSD);
  const despatchBenefitUSDperMT = demurrageCalc.netDespatchDays > 0 ? Math.abs(demurrageCalc.exposurePerMTUSD) : 0;

  const totalLandedCostUSDperMT = Math.round((
    fobPriceUSDperMT +
    oceanFreightUSDperMT +
    marineInsuranceUSDperMT +
    portTariffsUSDperMT +
    stevedoringUSDperMT +
    demurrageRiskUSDperMT -
    despatchBenefitUSDperMT
  ) * 100) / 100;

  const totalLandedCostINRperMT = Math.round((totalLandedCostUSDperMT * usdInrRate) * 100) / 100;
  const totalLandedCostTotalINR = Math.round(totalLandedCostINRperMT * cargoQuantityMT);

  return {
    cargoPriceUSDperMT: fobPriceUSDperMT,
    oceanFreightUSDperMT,
    marineInsuranceUSDperMT,
    portTariffsUSDperMT,
    stevedoringUSDperMT,
    demurrageRiskUSDperMT,
    despatchBenefitUSDperMT,
    totalLandedCostUSDperMT,
    usdInrRate,
    totalLandedCostINRperMT,
    totalLandedCostTotalINR,
  };
}

/**
 * Compare multiple international sourcing origins for the same procurement requirement.
 */
export function compareSourcingOrigins(
  commodity: string = 'Coking Coal',
  quantityMT: number = 75000,
  usdInrRate: number = 84.15
): OriginComparisonItem[] {
  const candidateOrigins = [
    {
      originName: 'Australia (Queensland / Hay Point)',
      originCountry: 'Australia',
      loadPort: 'Hay Point',
      dischargePort: 'Paradip Port',
      routeId: 'ROUTE-AU-PARADIP',
      vesselClass: 'Capesize' as VesselClassName,
      fobPriceUSDperMT: 228.00,
      transitDays: 16,
      qualityCV_kcal: 7100,
      qualityAsh_pct: 9.5,
    },
    {
      originName: 'Indonesia (East Kalimantan / Taboneo)',
      originCountry: 'Indonesia',
      loadPort: 'Taboneo Anchorage',
      dischargePort: 'Krishnapatnam Port',
      routeId: 'ROUTE-ID-KRISHNA',
      vesselClass: 'Panamax' as VesselClassName,
      fobPriceUSDperMT: 118.00,
      transitDays: 7,
      qualityCV_kcal: 5800,
      qualityAsh_pct: 6.2,
    },
    {
      originName: 'South Africa (Richards Bay Coal Terminal)',
      originCountry: 'South Africa',
      loadPort: 'Richards Bay',
      dischargePort: 'Visakhapatnam Port',
      routeId: 'ROUTE-ZA-VIZAG',
      vesselClass: 'Capesize' as VesselClassName,
      fobPriceUSDperMT: 112.50,
      transitDays: 16,
      qualityCV_kcal: 6000,
      qualityAsh_pct: 14.0,
    },
    {
      originName: 'USA Gulf (Mobile / New Orleans)',
      originCountry: 'USA',
      loadPort: 'Mobile, AL',
      dischargePort: 'Haldia Dock Complex',
      routeId: 'ROUTE-US-HALDIA',
      vesselClass: 'Supramax' as VesselClassName,
      fobPriceUSDperMT: 238.00,
      transitDays: 32,
      qualityCV_kcal: 7350,
      qualityAsh_pct: 7.8,
    }
  ];

  const results = candidateOrigins.map(orig => {
    const cost = calculateLandedCost({
      fobPriceUSDperMT: orig.fobPriceUSDperMT,
      routeId: orig.routeId,
      vesselClass: orig.vesselClass,
      cargoQuantityMT: quantityMT,
      usdInrRate,
    });

    const costPerGCV_INR = orig.qualityCV_kcal
      ? Math.round((cost.totalLandedCostINRperMT / orig.qualityCV_kcal) * 1000) / 1000
      : undefined;

    return {
      originName: orig.originName,
      originCountry: orig.originCountry,
      loadPort: orig.loadPort,
      dischargePort: orig.dischargePort,
      transitDays: orig.transitDays,
      fobPriceUSDperMT: orig.fobPriceUSDperMT,
      freightUSDperMT: cost.oceanFreightUSDperMT,
      insuranceUSDperMT: cost.marineInsuranceUSDperMT,
      portChargesUSDperMT: cost.portTariffsUSDperMT + cost.stevedoringUSDperMT,
      demurrageRiskUSDperMT: cost.demurrageRiskUSDperMT,
      landedCostUSDperMT: cost.totalLandedCostUSDperMT,
      landedCostINRperMT: cost.totalLandedCostINRperMT,
      qualityCV_kcal: orig.qualityCV_kcal,
      qualityAsh_pct: orig.qualityAsh_pct,
      costPerGCV_INR,
      isCheapest: false,
    };
  });

  // Flag cheapest landed cost
  let minCost = Infinity;
  results.forEach(r => {
    if (r.landedCostINRperMT < minCost) minCost = r.landedCostINRperMT;
  });
  results.forEach(r => {
    if (r.landedCostINRperMT === minCost) r.isCheapest = true;
  });

  return results;
}
