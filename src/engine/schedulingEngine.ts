import {
  CargoLot,
  PortData,
  StockyardSimulationDay,
  VesselClassName
} from '../types';
import { ECI_PORTS_DATA } from '../data/portsData';
import { MARITIME_ROUTES } from '../data/routesData';

export const INITIAL_CARGO_LOTS: CargoLot[] = [
  {
    id: 'LOT-2026-081',
    lotReference: 'LOT-COK-AU-081',
    commodity: 'Coking Coal',
    quantityMT: 150000,
    tolerancePct: 10,
    originPort: 'Hay Point',
    originCountry: 'Australia',
    dischargePort: 'Paradip Port',
    requiredDeliveryWindow: {
      earliest: '2026-09-02',
      latest: '2026-09-12',
    },
    fobPriceUSDperMT: 225.00,
    assignedVesselId: 'VESSEL-01',
    assignedLaycan: '02 Sep - 08 Sep 2026',
    status: 'Charter Proposed',
  },
  {
    id: 'LOT-2026-082',
    lotReference: 'LOT-THM-ID-082',
    commodity: 'Thermal Coal',
    quantityMT: 75000,
    tolerancePct: 5,
    originPort: 'Taboneo Anchorage',
    originCountry: 'Indonesia',
    dischargePort: 'Krishnapatnam Port',
    requiredDeliveryWindow: {
      earliest: '2026-08-30',
      latest: '2026-09-06',
    },
    fobPriceUSDperMT: 115.00,
    assignedVesselId: 'VESSEL-04',
    assignedLaycan: '30 Aug - 04 Sep 2026',
    status: 'Scheduled',
  },
  {
    id: 'LOT-2026-083',
    lotReference: 'LOT-THM-ZA-083',
    commodity: 'Thermal Coal',
    quantityMT: 165000,
    tolerancePct: 10,
    originPort: 'Richards Bay',
    originCountry: 'South Africa',
    dischargePort: 'Visakhapatnam Port',
    requiredDeliveryWindow: {
      earliest: '2026-09-10',
      latest: '2026-09-20',
    },
    fobPriceUSDperMT: 110.00,
    assignedVesselId: 'VESSEL-03',
    assignedLaycan: '10 Sep - 16 Sep 2026',
    status: 'Charter Proposed',
  },
  {
    id: 'LOT-2026-084',
    lotReference: 'LOT-LMS-AE-084',
    commodity: 'Limestone',
    quantityMT: 55000,
    tolerancePct: 5,
    originPort: 'Mina Saqr',
    originCountry: 'UAE',
    dischargePort: 'Chennai Port',
    requiredDeliveryWindow: {
      earliest: '2026-08-28',
      latest: '2026-09-04',
    },
    fobPriceUSDperMT: 28.50,
    assignedVesselId: 'VESSEL-07',
    assignedLaycan: '28 Aug - 02 Sep 2026',
    status: 'Scheduled',
  },
  {
    id: 'LOT-2026-085',
    lotReference: 'LOT-PET-US-085',
    commodity: 'Petcoke',
    quantityMT: 50000,
    tolerancePct: 5,
    originPort: 'Mobile / New Orleans',
    originCountry: 'USA',
    dischargePort: 'Haldia Dock Complex',
    requiredDeliveryWindow: {
      earliest: '2026-09-24',
      latest: '2026-10-05',
    },
    fobPriceUSDperMT: 142.00,
    status: 'Unassigned',
  }
];

export interface ScheduledArrival {
  date: string;
  vesselName: string;
  quantityMT: number;
  lotReference: string;
}

/**
 * Simulates port stockyard capacity and replenishment burn-down over 21 days.
 */
export function simulateStockyardInventory(
  portId: string,
  scheduledArrivals: ScheduledArrival[] = [],
  dailyConsumptionOverride?: number
): StockyardSimulationDay[] {
  const port = ECI_PORTS_DATA.find(p => p.id === portId) || ECI_PORTS_DATA[0];
  const maxCapacity = port.stockyardCapacityMT;
  const dailyEvac = dailyConsumptionOverride || port.dailyEvacuationRateMT;

  const simulation: StockyardSimulationDay[] = [];
  let currentStock = port.currentStockMT;
  const startDate = new Date('2026-08-25');

  for (let day = 0; day < 21; day++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];

    // Find arrivals on this day
    const matchingArrivals = scheduledArrivals.filter(a => a.date === dateStr);
    const totalArrivalsMT = matchingArrivals.reduce((acc, a) => acc + a.quantityMT, 0);
    const arrivingVessels = matchingArrivals.map(a => `${a.vesselName} (${(a.quantityMT / 1000).toFixed(0)}k MT)`);

    const openingStock = currentStock;
    const closingStock = Math.max(0, openingStock + totalArrivalsMT - dailyEvac);
    currentStock = closingStock;

    const utilizationPct = Math.round((closingStock / maxCapacity) * 1000) / 10;
    const isOverflowRisk = utilizationPct > 85;
    const isStockoutRisk = closingStock < dailyEvac * 2; // less than 2 days buffer

    simulation.push({
      dayIndex: day,
      date: dateStr,
      openingStockMT: Math.round(openingStock),
      arrivalsMT: totalArrivalsMT,
      arrivingVessels,
      dailyConsumptionMT: dailyEvac,
      closingStockMT: Math.round(closingStock),
      capacityUtilizationPct: utilizationPct,
      isOverflowRisk,
      isStockoutRisk,
    });
  }

  return simulation;
}

/**
 * Validates draft limits and vessel class compatibility at discharge port.
 */
export function validateBerthAndDraft(
  vesselClass: VesselClassName,
  portId: string
): { isValid: boolean; warning?: string } {
  const port = ECI_PORTS_DATA.find(p => p.id === portId);
  if (!port) return { isValid: true };

  if (port.id === 'PORT-HALDIA' || port.id === 'PORT-KOLKATA') {
    if (vesselClass === 'Capesize' || vesselClass === 'Post-Panamax' || vesselClass === 'Kamsarmax') {
      return {
        isValid: false,
        warning: `Draft restriction (${port.maxDraft}m max): ${vesselClass} vessels cannot berth at ${port.name}. Requires Supramax/Handysize geared vessels or lighterage at Sandheads.`
      };
    }
  }

  return { isValid: true };
}
