import {
  CharterRecommendation,
  CharterStrategyEvaluation,
  CharterType,
  VesselClassName,
  VesselCandidate
} from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { ECI_PORTS_DATA } from '../data/portsData';
import { CANDIDATE_VESSELS } from '../data/vesselsData';
import { generateFreightForecast } from './forecastingEngine';
import { calculateLaytimeAndDemurrage } from './demurrageEngine';

/**
 * Evaluates the three core chartering strategies: Voyage vs Time Charter vs COA.
 */
export function evaluateCharterStrategies(
  routeId: string,
  vesselClass: VesselClassName,
  cargoQuantityMT: number,
  annualVolumeMT: number = 600000
): CharterStrategyEvaluation[] {
  const route = MARITIME_ROUTES.find(r => r.id === routeId) || MARITIME_ROUTES[0];
  const forecast = generateFreightForecast(route.id, vesselClass, '30d');
  const spotUSDperMT = forecast.predictedRateUSDperMT;

  // Voyage Charter: direct spot/forecast rate + port costs absorbed by owner (except tariffs/demurrage)
  const voyageCostUSDperMT = spotUSDperMT;
  const voyageTotalUSD = Math.round(voyageCostUSDperMT * cargoQuantityMT);

  // Time Charter: charterer pays daily hire + bunker fuel on laden & ballast legs + port dues
  // Benchmark voyage duration (days) + port stay days (4 days)
  const totalTripDays = route.typicalVoyageDays * 2 + 4; // round-trip + port
  const avgDailyHire = vesselClass === 'Capesize' ? 28500 : vesselClass === 'Panamax' ? 14500 : 13000;
  const avgDailyBunkerMT = vesselClass === 'Capesize' ? 42 : vesselClass === 'Panamax' ? 26 : 20;
  const bunkerPrice = 595.5; // Singapore VLSFO
  const totalTimeCharterCost = (avgDailyHire * totalTripDays) + (avgDailyBunkerMT * totalTripDays * bunkerPrice);
  const tcCostUSDperMT = Math.round((totalTimeCharterCost / cargoQuantityMT) * 100) / 100;

  // COA (Contract of Affreightment): negotiated volume contract with locked base rate + bunker adjustment factor (BAF)
  // Usually offers 5-8% discount on expected spot for multi-parcel commitments
  const coaDiscountPct = annualVolumeMT >= 500000 ? 0.07 : 0.03;
  const coaCostUSDperMT = Math.round((spotUSDperMT * (1 - coaDiscountPct)) * 100) / 100;
  const coaTotalUSD = Math.round(coaCostUSDperMT * cargoQuantityMT);

  // Decision logic based on forward trend & volume
  const isTrendBullish = forecast.changeVsSpotPct > 4;
  const isHighVolume = annualVolumeMT >= 500000;

  return [
    {
      charterType: 'Voyage Charter',
      expectedCostUSDperMT: voyageCostUSDperMT,
      totalCostUSD: voyageTotalUSD,
      riskScore: isTrendBullish ? 48 : 28, // Spot price exposure
      breakEvenThresholdDays: 0,
      suitabilityScore: isHighVolume ? 68 : 88,
      pros: [
        'Zero idle time financial liability or repositioning exposure',
        'Owner bears risk of adverse weather slowdowns & bunker fluctuations (unless bunker clause applied)',
        'Maximum flexibility for one-off parcel procurement',
      ],
      cons: [
        'Vulnerable to freight spot rate spikes at fixture time',
        'Demurrage risk remains with charterer at discharge port',
      ],
      isRecommended: !isHighVolume && !isTrendBullish,
    },
    {
      charterType: 'Time Charter',
      expectedCostUSDperMT: tcCostUSDperMT,
      totalCostUSD: Math.round(totalTimeCharterCost),
      riskScore: 65, // Operational & fuel risk
      breakEvenThresholdDays: 14,
      suitabilityScore: isTrendBullish ? 76 : 52,
      pros: [
        'Full operational control of vessel speed, routing, and cargo parceling',
        'Cost savings if vessel turnaround and port dispatch are highly efficient',
        'Direct hedge against spot freight surges during strong market rallies',
      ],
      cons: [
        'Charterer pays 100% of fuel costs and port dues directly',
        'Significant off-hire / idle loss if cargo loading is delayed at origin',
      ],
      isRecommended: isTrendBullish && tcCostUSDperMT < spotUSDperMT,
    },
    {
      charterType: 'COA',
      expectedCostUSDperMT: coaCostUSDperMT,
      totalCostUSD: coaTotalUSD,
      riskScore: 22,
      breakEvenThresholdDays: 0,
      suitabilityScore: isHighVolume ? 92 : 60,
      pros: [
        `Secures ~${(coaDiscountPct * 100).toFixed(0)}% discount through annual volume commitment (${(annualVolumeMT / 1000).toFixed(0)}k MT/yr)`,
        'Guaranteed laycan windows and owner tonnage priority',
        'Protects budget certainty against quarterly freight volatility',
      ],
      cons: [
        'Contractual volume default penalties if procurement demand drops',
        'Subject to Bunker Adjustment Factor (BAF) indexation formulas',
      ],
      isRecommended: isHighVolume,
    }
  ];
}

/**
 * Generate complete charter recommendation including ranked candidate vessels and laycan optimization.
 */
export function generateCharterRecommendation(
  routeId: string,
  vesselClass: VesselClassName,
  cargoQuantityMT: number,
  targetDeliveryStart: string = '2026-09-01',
  targetDeliveryEnd: string = '2026-09-15'
): CharterRecommendation {
  const route = MARITIME_ROUTES.find(r => r.id === routeId) || MARITIME_ROUTES[0];
  const port = ECI_PORTS_DATA.find(p => p.name.toLowerCase().includes(route.dischargePort.toLowerCase().split(' ')[0])) || ECI_PORTS_DATA[0];
  const forecast = generateFreightForecast(route.id, vesselClass, '30d');
  const strategyEvals = evaluateCharterStrategies(route.id, vesselClass, cargoQuantityMT);
  const bestStrategy = strategyEvals.find(s => s.isRecommended) || strategyEvals[0];

  const demurrageEval = calculateLaytimeAndDemurrage(cargoQuantityMT, port);

  // Filter matching vessel candidates
  const matchingVessels = CANDIDATE_VESSELS.filter(v => v.vesselClass === vesselClass);

  // Rank candidate vessels
  const rankedVessels = matchingVessels.map(v => {
    // Laycan readiness check
    const arrivalDate = new Date('2026-08-25');
    arrivalDate.setDate(arrivalDate.getDate() + v.etaDays);
    const arrivalDateStr = arrivalDate.toISOString().split('T')[0];

    const isWithinWindow = arrivalDateStr >= targetDeliveryStart && arrivalDateStr <= targetDeliveryEnd;
    const laycanCompliance: 'Optimal' | 'Tight' | 'Risky' = isWithinWindow ? 'Optimal' : v.etaDays <= 7 ? 'Tight' : 'Risky';

    // Composite ranking score (100 is best)
    const vettingWeight = (v.vettingScore / 5.0) * 35;
    const costWeight = Math.max(0, 35 - ((v.dailyHireRateUSD - 12000) / 1000));
    const laycanWeight = laycanCompliance === 'Optimal' ? 20 : laycanCompliance === 'Tight' ? 12 : 4;
    const ageWeight = Math.max(0, 10 - (2026 - v.builtYear));
    const compositeRankScore = Math.round((vettingWeight + costWeight + laycanWeight + ageWeight) * 10) / 10;

    const evaluatedCostUSD = Math.round(forecast.predictedRateUSDperMT * cargoQuantityMT + (v.dailyHireRateUSD * 0.5));
    const costPerMTUSD = Math.round((evaluatedCostUSD / cargoQuantityMT) * 100) / 100;

    return {
      ...v,
      totalEvaluatedCostUSD: evaluatedCostUSD,
      costPerMTUSD,
      laycanCompliance,
      compositeRankScore,
    };
  }).sort((a, b) => b.compositeRankScore - a.compositeRankScore);

  const totalFreight = Math.round(forecast.predictedRateUSDperMT * cargoQuantityMT);
  const netShippingCostUSDperMT = Math.round((forecast.predictedRateUSDperMT + demurrageEval.exposurePerMTUSD) * 100) / 100;

  const optimalFixtureDate = new Date('2026-08-28').toISOString().split('T')[0];

  return {
    id: `REC-${Date.now().toString().slice(-6)}`,
    routeId: route.id,
    vesselClass,
    cargoQuantityMT,
    recommendedCharterType: bestStrategy.charterType,
    recommendedLaycanWindow: {
      start: targetDeliveryStart,
      end: targetDeliveryEnd,
      optimalFixtureDate,
    },
    expectedFreightRateUSDperMT: forecast.predictedRateUSDperMT,
    expectedTotalFreightUSD: totalFreight,
    expectedDemurrageRiskUSD: demurrageEval.totalDemurrageCostUSD,
    expectedDespatchBenefitUSD: demurrageEval.totalDespatchBenefitUSD,
    netShippingCostUSDperMT,
    rankedVessels,
    rationale: [
      `Selected ${bestStrategy.charterType} based on ${forecast.changeVsSpotPct >= 0 ? '+' : ''}${forecast.changeVsSpotPct}% 30-day forward freight projection.`,
      `Target laycan (${targetDeliveryStart} to ${targetDeliveryEnd}) aligns with optimal stockyard replenishment schedule at ${route.dischargePort}.`,
      `Ranked Top Candidate: ${rankedVessels[0]?.name || 'Available Vessel'} with RightShip Score ${rankedVessels[0]?.vettingScore || 4.5}/5.0 and composite index of ${rankedVessels[0]?.compositeRankScore || 88}/100.`,
      `Demurrage risk estimated at $${demurrageEval.totalDemurrageCostUSD.toLocaleString()} due to ${port.averageBerthWaitHours}h average berth queue at ${port.name}.`
    ],
    status: 'Pending Review'
  };
}
