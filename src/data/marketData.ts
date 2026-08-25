import { MarketIndexItem, BunkerPriceItem, FXRateItem, AlertItem } from '../types';

export const INITIAL_MARKET_INDICES: MarketIndexItem[] = [
  {
    code: 'BDI',
    name: 'Baltic Dry Index',
    value: 1845,
    change1d: 38,
    change1dPct: 2.10,
    change30dPct: 14.8,
    high52w: 2420,
    low52w: 1210,
    isStale: false,
    lastUpdated: 'Today, 14:30 GMT',
    historical: [
      { date: '2026-07-25', value: 1610 },
      { date: '2026-07-30', value: 1640 },
      { date: '2026-08-04', value: 1695 },
      { date: '2026-08-09', value: 1730 },
      { date: '2026-08-14', value: 1780 },
      { date: '2026-08-19', value: 1807 },
      { date: '2026-08-25', value: 1845 },
    ]
  },
  {
    code: 'BCI',
    name: 'Baltic Capesize Index',
    value: 2980,
    change1d: 85,
    change1dPct: 2.94,
    change30dPct: 22.4,
    high52w: 4150,
    low52w: 1650,
    isStale: false,
    lastUpdated: 'Today, 14:30 GMT',
    historical: [
      { date: '2026-07-25', value: 2435 },
      { date: '2026-07-30', value: 2520 },
      { date: '2026-08-04', value: 2680 },
      { date: '2026-08-09', value: 2790 },
      { date: '2026-08-14', value: 2840 },
      { date: '2026-08-19', value: 2895 },
      { date: '2026-08-25', value: 2980 },
    ]
  },
  {
    code: 'BPI',
    name: 'Baltic Panamax Index',
    value: 1540,
    change1d: 18,
    change1dPct: 1.18,
    change30dPct: 8.2,
    high52w: 2180,
    low52w: 1120,
    isStale: false,
    lastUpdated: 'Today, 14:30 GMT',
    historical: [
      { date: '2026-07-25', value: 1420 },
      { date: '2026-07-30', value: 1445 },
      { date: '2026-08-04', value: 1470 },
      { date: '2026-08-09', value: 1500 },
      { date: '2026-08-14', value: 1515 },
      { date: '2026-08-19', value: 1522 },
      { date: '2026-08-25', value: 1540 },
    ]
  },
  {
    code: 'BSI',
    name: 'Baltic Supramax Index',
    value: 1290,
    change1d: -6,
    change1dPct: -0.46,
    change30dPct: 3.5,
    high52w: 1650,
    low52w: 980,
    isStale: false,
    lastUpdated: 'Today, 14:30 GMT',
    historical: [
      { date: '2026-07-25', value: 1245 },
      { date: '2026-07-30', value: 1260 },
      { date: '2026-08-04', value: 1278 },
      { date: '2026-08-09', value: 1285 },
      { date: '2026-08-14', value: 1298 },
      { date: '2026-08-19', value: 1296 },
      { date: '2026-08-25', value: 1290 },
    ]
  }
];

export const INITIAL_BUNKER_PRICES: BunkerPriceItem[] = [
  {
    port: 'Singapore',
    vlsfoUSD: 595.50,
    mgoUSD: 742.00,
    changeVlsfo: 4.50,
    changeMgo: -2.00,
    lastUpdated: '25 Aug 2026 11:00 UTC'
  },
  {
    port: 'Fujairah (UAE)',
    vlsfoUSD: 588.00,
    mgoUSD: 785.50,
    changeVlsfo: 6.00,
    changeMgo: 3.50,
    lastUpdated: '25 Aug 2026 10:30 UTC'
  },
  {
    port: 'Colombo (Sri Lanka)',
    vlsfoUSD: 625.00,
    mgoUSD: 810.00,
    changeVlsfo: 2.00,
    changeMgo: 0.00,
    lastUpdated: '25 Aug 2026 09:15 UTC'
  },
  {
    port: 'Rotterdam',
    vlsfoUSD: 545.00,
    mgoUSD: 715.00,
    changeVlsfo: -3.50,
    changeMgo: -5.00,
    lastUpdated: '25 Aug 2026 12:00 UTC'
  }
];

export const INITIAL_FX_RATES: FXRateItem[] = [
  { pair: 'USD/INR', rate: 84.15, change1d: 0.12, lastUpdated: 'Real-time (RBI Ref: 84.08)' },
  { pair: 'EUR/USD', rate: 1.088, change1d: -0.002, lastUpdated: 'Real-time' },
  { pair: 'USD/BRL', rate: 5.48, change1d: 0.03, lastUpdated: 'Real-time' },
  { pair: 'USD/ZAR', rate: 17.92, change1d: -0.08, lastUpdated: 'Real-time' },
  { pair: 'AUD/USD', rate: 0.655, change1d: 0.004, lastUpdated: 'Real-time' },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-101',
    title: 'Capesize Freight Surge Warning (Australia → Paradip)',
    type: 'FREIGHT_VOLATILITY',
    severity: 'High',
    message: 'Capesize spot rates up +11.4% week-on-week driven by heightened iron ore fixture activity from Pilbara and tight vessel supply in Singapore.',
    triggeredAt: '15 mins ago',
    routeOrPort: 'ROUTE-AU-PARADIP',
    metricDelta: '+11.4% 7d',
    isAcknowledged: false,
  },
  {
    id: 'ALT-102',
    title: 'Severe Congestion & Berth Queue at Haldia Dock Complex',
    type: 'PORT_CONGESTION',
    severity: 'Critical',
    message: 'Average berth wait time exceeded 58 hours due to river siltation and tidal draft windows. Demurrage exposure risk is elevated to $19,500/day.',
    triggeredAt: '1 hour ago',
    routeOrPort: 'PORT-HALDIA',
    metricDelta: '58h Avg Wait',
    isAcknowledged: false,
  },
  {
    id: 'ALT-103',
    title: 'Stockyard Capacity Alert at Paradip Port',
    type: 'STOCKYARD_CAPACITY',
    severity: 'Medium',
    message: 'Coal stockyard reached 73% capacity (620,000 MT / 850,000 MT). 2 upcoming Capesize discharges within 10 days will trigger buffer overflow if evacuation rate remains below 32,000 MT/day.',
    triggeredAt: '3 hours ago',
    routeOrPort: 'PORT-PARADIP',
    metricDelta: '73% Utilization',
    isAcknowledged: false,
  },
  {
    id: 'ALT-104',
    title: 'Laycan Window Tightening for MV Pacific Pioneer',
    type: 'LAYCAN_RISK',
    severity: 'Medium',
    message: 'Speed reduction observed in Malacca Strait (10.2 kts vs 12.5 kts eco-speed). ETA at Krishnapatnam is currently 4 hours before cancelling laycan date.',
    triggeredAt: '5 hours ago',
    routeOrPort: 'VESSEL-04',
    metricDelta: '-2.3 kts',
    isAcknowledged: true,
  }
];
