import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Calendar,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  Ship,
  ArrowRight,
  TrendingDown,
  Layers,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { CargoLot, PortData } from '../types';
import { ECI_PORTS_DATA } from '../data/portsData';
import {
  INITIAL_CARGO_LOTS,
  simulateStockyardInventory,
  validateBerthAndDraft
} from '../engine/schedulingEngine';

interface ProcurementSchedulerModuleProps {
  onPlanCharterForLot?: (lot: CargoLot) => void;
}

export const ProcurementSchedulerModule: React.FC<ProcurementSchedulerModuleProps> = ({
  onPlanCharterForLot,
}) => {
  const [cargoLots, setCargoLots] = useState<CargoLot[]>(INITIAL_CARGO_LOTS);
  const [selectedPortId, setSelectedPortId] = useState<string>('PORT-PARADIP');
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);

  // New Lot Form State
  const [newCommodity, setNewCommodity] = useState<CargoLot['commodity']>('Coking Coal');
  const [newQuantityMT, setNewQuantityMT] = useState<number>(75000);
  const [newOriginPort, setNewOriginPort] = useState<string>('Hay Point');
  const [newOriginCountry, setNewOriginCountry] = useState<string>('Australia');
  const [newDischargePort, setNewDischargePort] = useState<string>('Paradip Port');
  const [newEarliestDate, setNewEarliestDate] = useState<string>('2026-09-15');
  const [newLatestDate, setNewLatestDate] = useState<string>('2026-09-25');
  const [newFobPrice, setNewFobPrice] = useState<number>(220);

  const selectedPort: PortData = useMemo(() => {
    return ECI_PORTS_DATA.find(p => p.id === selectedPortId) || ECI_PORTS_DATA[0];
  }, [selectedPortId]);

  // Derive scheduled arrivals for selected port
  const scheduledArrivals = useMemo(() => {
    return cargoLots
      .filter(l => l.dischargePort.toLowerCase().includes(selectedPort.name.toLowerCase().split(' ')[0]) && l.assignedVesselId)
      .map(l => ({
        date: l.requiredDeliveryWindow.earliest,
        vesselName: l.assignedVesselId || 'Vessel',
        quantityMT: l.quantityMT,
        lotReference: l.lotReference,
      }));
  }, [cargoLots, selectedPort]);

  const stockyardSimulation = useMemo(() => {
    return simulateStockyardInventory(selectedPort.id, scheduledArrivals);
  }, [selectedPort, scheduledArrivals]);

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: CargoLot = {
      id: `LOT-2026-${Date.now().toString().slice(-3)}`,
      lotReference: `LOT-${newCommodity.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      commodity: newCommodity,
      quantityMT: newQuantityMT,
      tolerancePct: 10,
      originPort: newOriginPort,
      originCountry: newOriginCountry,
      dischargePort: newDischargePort,
      requiredDeliveryWindow: {
        earliest: newEarliestDate,
        latest: newLatestDate,
      },
      fobPriceUSDperMT: newFobPrice,
      status: 'Unassigned',
    };

    setCargoLots([newLot, ...cargoLots]);
    setIsAddLotModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Cargo Procurement & Stockyard Scheduling</h2>
            <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Warehouse className="w-3 h-3 text-amber-400" />
              Stockyard Guard v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Align procurement parcel laycans against port stockyard capacity, daily plant burn rates, and vessel berth draft limits.
          </p>
        </div>

        <button
          onClick={() => setIsAddLotModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white text-xs font-bold transition shadow-lg shadow-sky-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Procurement Cargo Lot</span>
        </button>
      </div>

      {/* Cargo Lots Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Active Bulk Cargo Procurement Lots</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{cargoLots.length} Open Lots Planned</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 pl-2">Lot Ref & Commodity</th>
                <th className="pb-2">Quantity (MT)</th>
                <th className="pb-2">Origin Port</th>
                <th className="pb-2">Target Discharge Port</th>
                <th className="pb-2">Required Delivery Window</th>
                <th className="pb-2">FOB Price</th>
                <th className="pb-2">Vessel Assignment</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {cargoLots.map((lot) => {
                const statusBadge =
                  lot.status === 'Scheduled'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : lot.status === 'Charter Proposed'
                    ? 'bg-sky-950 text-sky-400 border-sky-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800';

                return (
                  <tr key={lot.id} className="hover:bg-navy-800/50 transition">
                    <td className="py-3 pl-2 font-sans font-semibold text-slate-200">
                      <div>{lot.lotReference}</div>
                      <span className="text-[10px] text-amber-400 font-mono">{lot.commodity} (±{lot.tolerancePct}%)</span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      {(lot.quantityMT / 1000).toFixed(0)}k MT
                    </td>
                    <td className="py-3 font-sans text-slate-300">
                      <div>{lot.originPort}</div>
                      <div className="text-[10px] text-slate-400">{lot.originCountry}</div>
                    </td>
                    <td className="py-3 font-sans text-slate-300">
                      {lot.dischargePort}
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{lot.requiredDeliveryWindow.earliest}</div>
                      <div className="text-[10px] text-slate-400">to {lot.requiredDeliveryWindow.latest}</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      ${lot.fobPriceUSDperMT.toFixed(2)}/MT
                    </td>
                    <td className="py-3 font-sans">
                      {lot.assignedVesselId ? (
                        <div>
                          <div className="text-sky-300 font-bold flex items-center gap-1">
                            <Ship className="w-3 h-3" />
                            {lot.assignedVesselId}
                          </div>
                          <span className="text-[10px] text-slate-400">{lot.assignedLaycan}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge}`}>
                        {lot.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-sans">
                      {onPlanCharterForLot && (
                        <button
                          onClick={() => onPlanCharterForLot(lot)}
                          className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-sky-600 text-slate-200 hover:text-white text-[11px] font-semibold transition border border-navy-700 hover:border-sky-500"
                        >
                          Plan Charter
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Port Stockyard Inventory Simulation */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Port Stockyard 21-Day Dynamic Inventory Simulation
            </div>
            <h3 className="text-sm font-bold text-white">
              Stockyard Buffer & Burn-Down Projections for {selectedPort.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Select Port:</span>
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              {ECI_PORTS_DATA.map((port) => (
                <option key={port.id} value={port.id}>
                  {port.name} (Max: {(port.stockyardCapacityMT / 1000).toFixed(0)}k MT)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stockyard KPI metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Max Stockyard Capacity</div>
            <div className="text-base font-bold text-white">{(selectedPort.stockyardCapacityMT / 1000).toFixed(0)}k MT</div>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Current Stock Level</div>
            <div className="text-base font-bold text-sky-400">
              {(selectedPort.currentStockMT / 1000).toFixed(0)}k MT ({Math.round((selectedPort.currentStockMT / selectedPort.stockyardCapacityMT) * 100)}%)
            </div>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Daily Evacuation / Burn</div>
            <div className="text-base font-bold text-white">{(selectedPort.dailyEvacuationRateMT / 1000).toFixed(0)}k MT / day</div>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Days of Inventory Cover</div>
            <div className="text-base font-bold text-emerald-400">
              {(selectedPort.currentStockMT / selectedPort.dailyEvacuationRateMT).toFixed(1)} Days
            </div>
          </div>
        </div>

        {/* Stockyard Simulation Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stockyardSimulation}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                domain={[0, selectedPort.stockyardCapacityMT * 1.1]}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k MT`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b192c',
                  borderColor: '#0284c7',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
                formatter={(val: any, name: string) => [`${Number(val).toLocaleString()} MT`, name]}
              />
              <Legend verticalAlign="top" height={32} />

              <ReferenceLine
                y={selectedPort.stockyardCapacityMT * 0.85}
                label={{ value: '85% Overflow Warning', fill: '#f43f5e', fontSize: 10 }}
                stroke="#f43f5e"
                strokeDasharray="4 4"
              />

              <Area
                type="monotone"
                dataKey="closingStockMT"
                name="Stockyard Inventory"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="#0ea5e9"
                fillOpacity={0.2}
              />
              <Line
                type="stepAfter"
                dataKey="arrivalsMT"
                name="Vessel Discharge Replenishment"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Cargo Lot Modal */}
      {isAddLotModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-400" />
                <span>Create New Procurement Cargo Lot</span>
              </h3>
              <button
                onClick={() => setIsAddLotModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Commodity Type</label>
                  <select
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value as any)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Coking Coal">Coking Coal</option>
                    <option value="Thermal Coal">Thermal Coal</option>
                    <option value="Iron Ore">Iron Ore</option>
                    <option value="Limestone">Limestone</option>
                    <option value="Petcoke">Petcoke</option>
                    <option value="Grain / Fertilizer">Grain / Fertilizer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Quantity (MT)</label>
                  <input
                    type="number"
                    step="5000"
                    value={newQuantityMT}
                    onChange={(e) => setNewQuantityMT(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Origin Port</label>
                  <input
                    type="text"
                    value={newOriginPort}
                    onChange={(e) => setNewOriginPort(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Origin Country</label>
                  <input
                    type="text"
                    value={newOriginCountry}
                    onChange={(e) => setNewOriginCountry(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Discharge Port</label>
                  <select
                    value={newDischargePort}
                    onChange={(e) => setNewDischargePort(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                  >
                    {ECI_PORTS_DATA.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">FOB Price (USD/MT)</label>
                  <input
                    type="number"
                    step="1"
                    value={newFobPrice}
                    onChange={(e) => setNewFobPrice(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Earliest Delivery Date</label>
                  <input
                    type="date"
                    value={newEarliestDate}
                    onChange={(e) => setNewEarliestDate(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Latest Delivery Date</label>
                  <input
                    type="date"
                    value={newLatestDate}
                    onChange={(e) => setNewLatestDate(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30"
                >
                  Save & Schedule Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
