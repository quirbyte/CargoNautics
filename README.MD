# Cargo-Nautics AI

**Intelligent Freight Forecasting & Chartering Optimizer** — a dry-bulk shipping decision-support dashboard for chartering desks, operations, and procurement teams.

Cargo-Nautics AI brings together freight-rate forecasting, charter-type optimization (Voyage / Time Charter / COA), laytime & demurrage modeling, landed-cost analysis, live maritime route mapping, risk alerts, and an approval/audit trail into a single React + TypeScript workspace.

## Features

- **Market Overview** — live-style view of freight market indices, bunker prices, and FX rates, with quick access to run a forecast.
- **Freight Forecast Module** — generates freight-rate forecasts per route and vessel class (Capesize / Panamax / Supramax) across configurable horizons and model algorithms, driven by route baseline benchmark rates.
- **Charter Optimizer Module** — evaluates the three core chartering strategies (Voyage Charter, Time Charter, and Contract of Affreightment) for a given route, vessel class, and cargo quantity, and produces a ranked recommendation with rationale.
- **Landed Cost Module** — computes full landed-cost breakdowns (FOB price, freight, laytime/demurrage, FX) and compares alternative origins.
- **Maritime Map Module** — interactive Leaflet-based map of routes, ports, and vessels.
- **Alerts & Risk Module** — surfaces and tracks acknowledgement of market and operational risk alerts.
- **Approval & Audit Module** — role-based review workflow for charter recommendations (approve/override), with a full audit log of actions and rationale.
- **Export** — export reports/recommendations to PDF (jsPDF) and Excel (SheetJS/xlsx).
- **Procurement Scheduler Module** — cargo-lot scheduling and stockyard simulation engine (currently present in the codebase; wiring into the main navigation is in progress).

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) — build tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Recharts](https://recharts.org/) — charts and forecast visualizations
- [React Leaflet](https://react-leaflet.js.org/) / [Leaflet](https://leafletjs.com/) — maritime map
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — PDF export
- [SheetJS (xlsx)](https://sheetjs.com/) — Excel export
- [lucide-react](https://lucide.dev/) — icons

## Project Structure

```
src/
├── components/          # UI modules (Header, Sidebar, and each workspace tab)
│   ├── MarketOverview.tsx
│   ├── FreightForecastModule.tsx
│   ├── CharterOptimizerModule.tsx
│   ├── ProcurementSchedulerModule.tsx
│   ├── LandedCostModule.tsx
│   ├── MaritimeMapModule.tsx
│   ├── AlertsRiskModule.tsx
│   ├── ApprovalAuditModule.tsx
│   └── ExportModal.tsx
├── engine/               # Core business logic, independent of UI
│   ├── forecastingEngine.ts
│   ├── charterOptimizer.ts
│   ├── demurrageEngine.ts
│   ├── landedCostEngine.ts
│   └── schedulingEngine.ts
├── data/                 # Seed/reference data
│   ├── marketData.ts
│   ├── portsData.ts
│   ├── routesData.ts
│   └── vesselsData.ts
├── types/                # Shared TypeScript types
├── utils/                # Export and other helpers
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/quirbyte/CargoNautics.git
cd CargoNautics
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server (see terminal output for the local URL).

### Build

```bash
npm run build
```

Type-checks the project with `tsc` and produces a production build.

### Preview

```bash
npm run preview
```

Serves the production build locally for a final check.

## Roles

The dashboard supports role-based views (e.g. **Chartering Analyst**, **Operations Manager**, **Procurement Lead**), which affect what actions are available in the Approval & Audit workflow.

## License

© MIT LICENSE 2026