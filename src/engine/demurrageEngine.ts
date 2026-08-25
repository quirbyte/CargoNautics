import { PortData } from '../types';

export interface LaytimeCalculationResult {
  cargoQuantityMT: number;
  loadingRateMTperDay: number;
  dischargeRateMTperDay: number;
  allowedLoadingDays: number;
  allowedDischargeDays: number;
  totalAllowedLaytimeDays: number;
  estimatedPortStayDays: number;
  berthWaitDays: number;
  weatherDelayDays: number;
  netDemurrageDays: number;
  netDespatchDays: number;
  dailyDemurrageRateUSD: number;
  dailyDespatchRateUSD: number;
  totalDemurrageCostUSD: number;
  totalDespatchBenefitUSD: number;
  netExposureUSD: number;
  exposurePerMTUSD: number;
  riskRating: 'Low' | 'Moderate' | 'High' | 'Severe';
}

/**
 * Calculate laytime, demurrage, and despatch exposure for a bulk shipment.
 */
export function calculateLaytimeAndDemurrage(
  cargoQuantityMT: number,
  port: PortData,
  loadingRateMTperDay: number = 25000,
  dischargeRateMTperDay: number = 20000,
  weatherDelayDays: number = 0.5
): LaytimeCalculationResult {
  const allowedLoadingDays = cargoQuantityMT / loadingRateMTperDay;
  const allowedDischargeDays = cargoQuantityMT / dischargeRateMTperDay;
  const totalAllowedLaytimeDays = Math.round((allowedLoadingDays + allowedDischargeDays) * 100) / 100;

  // Actual expected port stay (berth waiting + discharge time + weather delays)
  const berthWaitDays = Math.round((port.averageBerthWaitHours / 24) * 100) / 100;
  const actualDischargeDays = Math.round((cargoQuantityMT / (dischargeRateMTperDay * 0.9)) * 100) / 100;
  const estimatedPortStayDays = Math.round((berthWaitDays + actualDischargeDays + weatherDelayDays) * 100) / 100;

  // Total time used in port operations vs allowed laytime for discharge
  const timeUsedAtDischarge = berthWaitDays + actualDischargeDays + weatherDelayDays;
  const laytimeDiff = timeUsedAtDischarge - allowedDischargeDays;

  let netDemurrageDays = 0;
  let netDespatchDays = 0;
  let totalDemurrageCostUSD = 0;
  let totalDespatchBenefitUSD = 0;

  if (laytimeDiff > 0) {
    netDemurrageDays = Math.round(laytimeDiff * 100) / 100;
    totalDemurrageCostUSD = Math.round(netDemurrageDays * port.demurrageRatePerDayUSD);
  } else {
    netDespatchDays = Math.round(Math.abs(laytimeDiff) * 100) / 100;
    totalDespatchBenefitUSD = Math.round(netDespatchDays * port.despatchRatePerDayUSD);
  }

  const netExposureUSD = totalDemurrageCostUSD - totalDespatchBenefitUSD;
  const exposurePerMTUSD = Math.round((netExposureUSD / cargoQuantityMT) * 100) / 100;

  const riskRating: 'Low' | 'Moderate' | 'High' | 'Severe' =
    netDemurrageDays >= 3 ? 'Severe' :
    netDemurrageDays >= 1.5 ? 'High' :
    netDemurrageDays > 0 ? 'Moderate' : 'Low';

  return {
    cargoQuantityMT,
    loadingRateMTperDay,
    dischargeRateMTperDay,
    allowedLoadingDays: Math.round(allowedLoadingDays * 100) / 100,
    allowedDischargeDays: Math.round(allowedDischargeDays * 100) / 100,
    totalAllowedLaytimeDays,
    estimatedPortStayDays,
    berthWaitDays,
    weatherDelayDays,
    netDemurrageDays,
    netDespatchDays,
    dailyDemurrageRateUSD: port.demurrageRatePerDayUSD,
    dailyDespatchRateUSD: port.despatchRatePerDayUSD,
    totalDemurrageCostUSD,
    totalDespatchBenefitUSD,
    netExposureUSD,
    exposurePerMTUSD,
    riskRating,
  };
}
