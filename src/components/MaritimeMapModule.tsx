import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  Ship,
  MapPin,
  Anchor,
  Filter,
  Navigation,
  Compass,
  AlertCircle,
  Eye
} from 'lucide-react';
import { VesselCandidate, VesselClassName } from '../types';
import { MARITIME_ROUTES } from '../data/routesData';
import { ECI_PORTS_DATA } from '../data/portsData';
import { CANDIDATE_VESSELS } from '../data/vesselsData';

// Custom Leaflet Icons using SVG Data URIs
const createPortIcon = (congestion: string) => {
  const color =
    congestion === 'Severe' ? '#f43f5e' :
    congestion === 'High' ? '#f59e0b' :
    congestion === 'Moderate' ? '#0284c7' : '#10b981';

  return L.divIcon({
    className: 'custom-port-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const createVesselIcon = (vesselClass: VesselClassName) => {
  const color =
    vesselClass === 'Capesize' ? '#38bdf8' :
    vesselClass === 'Kamsarmax' || vesselClass === 'Panamax' ? '#34d399' : '#fbbf24';

  return L.divIcon({
    className: 'custom-vessel-icon',
    html: `
      <div style="background: #0b192c; border: 2px solid ${color}; border-radius: 6px; padding: 3px 6px; font-size: 10px; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); white-space: nowrap;">
        <span style="color: ${color};">▲</span>
      </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const MaritimeMapModule: React.FC = () => {
  const [selectedVesselClass, setSelectedVesselClass] = useState<string>('ALL');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');
  const [activeVesselModal, setActiveVesselModal] = useState<VesselCandidate | null>(null);

  const filteredVessels = CANDIDATE_VESSELS.filter(v => {
    if (selectedVesselClass !== 'ALL' && v.vesselClass !== selectedVesselClass) return false;
    return true;
  });

  const filteredRoutes = MARITIME_ROUTES.filter(r => {
    if (selectedRouteId !== 'ALL' && r.id !== selectedRouteId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Maritime Route GIS & Live AIS Fleet Telemetry</h2>
            <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Navigation className="w-3 h-3 text-sky-400 animate-spin-slow" />
              Live AIS Streaming
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive geospatial visualization of international bulk shipping corridors, choke points (Malacca / Sunda / Suez), and candidate fleet positions.
          </p>
        </div>

        {/* Map Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-navy-900 border border-navy-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Vessel Class:</span>
            <select
              value={selectedVesselClass}
              onChange={(e) => setSelectedVesselClass(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL">All Classes ({CANDIDATE_VESSELS.length})</option>
              <option value="Capesize">Capesize</option>
              <option value="Post-Panamax">Post-Panamax</option>
              <option value="Kamsarmax">Kamsarmax</option>
              <option value="Panamax">Panamax</option>
              <option value="Supramax">Supramax</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-navy-900 border border-navy-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-semibold">Route Corridors:</span>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none max-w-[160px] truncate"
            >
              <option value="ALL">All Trade Corridors</option>
              {MARITIME_ROUTES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="glass-panel p-2 rounded-2xl h-[560px] relative overflow-hidden">
        <MapContainer
          center={[12.0, 85.0]}
          zoom={4}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        >
          {/* CartoDB Dark Matter Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Shipping Lane Polylines */}
          {filteredRoutes.map((route) => {
            const positions = [
              route.coordinates.load,
              ...route.coordinates.waypoints,
              route.coordinates.discharge,
            ];

            return (
              <Polyline
                key={route.id}
                positions={positions}
                color="#0284c7"
                weight={2.5}
                dashArray="6 6"
                opacity={0.7}
              >
                <LeafletTooltip sticky>
                  <div className="text-xs font-bold text-slate-800">
                    <div>{route.name}</div>
                    <div className="text-[10px] text-slate-600">{route.distanceNM.toLocaleString()} NM • ~{route.typicalVoyageDays} Voyage Days</div>
                  </div>
                </LeafletTooltip>
              </Polyline>
            );
          })}

          {/* ECI Discharge Port Markers */}
          {ECI_PORTS_DATA.map((port) => (
            <Marker
              key={port.id}
              position={port.coordinates}
              icon={createPortIcon(port.currentCongestionLevel)}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-sky-400 text-sm flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5" />
                    <span>{port.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Draft: <span className="text-white font-mono font-bold">{port.maxDraft}m</span> • Max DWT: <span className="text-white font-mono">{(port.maxDWT/1000).toFixed(0)}k MT</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Berth Queue: <span className="text-amber-400 font-mono font-bold">{port.averageBerthWaitHours} hrs avg</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Stockyard: <span className="text-emerald-400 font-mono">{(port.currentStockMT/1000).toFixed(0)}k / {(port.stockyardCapacityMT/1000).toFixed(0)}k MT</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Candidate Fleet AIS Vessel Markers */}
          {filteredVessels.map((vessel) => (
            <Marker
              key={vessel.id}
              position={vessel.currentCoordinates}
              icon={createVesselIcon(vessel.vesselClass)}
              eventHandlers={{
                click: () => setActiveVesselModal(vessel)
              }}
            >
              <LeafletTooltip>
                <div className="text-xs font-bold text-slate-900">
                  <div>{vessel.name} ({vessel.vesselClass})</div>
                  <div className="text-[10px] text-slate-600">Speed: {vessel.ecoSpeedKnots} kts • ETA: {vessel.etaDays}d</div>
                </div>
              </LeafletTooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-navy-950/90 backdrop-blur-md border border-navy-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 text-[11px]">Port Normal Wait (&lt;20h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 text-[11px]">Port Moderate Congestion (20-40h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300 text-[11px]">Port Severe Queue (&gt;40h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-400"></span>
            <span className="text-slate-300 text-[11px]">Bulk Shipping Corridors</span>
          </div>
        </div>
      </div>

      {/* Selected Vessel Modal Info Card */}
      {activeVesselModal && (
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-sky-400 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-base font-bold text-white">{activeVesselModal.name}</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {activeVesselModal.vesselClass} • {(activeVesselModal.dwt / 1000).toFixed(0)}k DWT • Built {activeVesselModal.builtYear} ({activeVesselModal.flag})
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveVesselModal(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-navy-800 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 bg-navy-950 rounded-xl border border-navy-800">
              <div className="text-[10px] text-slate-400 font-sans uppercase">RightShip Vetting</div>
              <div className="text-sm font-bold text-amber-400">{activeVesselModal.vettingScore} / 5.0 ★</div>
            </div>
            <div className="p-2.5 bg-navy-950 rounded-xl border border-navy-800">
              <div className="text-[10px] text-slate-400 font-sans uppercase">Daily Hire Rate</div>
              <div className="text-sm font-bold text-white">${activeVesselModal.dailyHireRateUSD.toLocaleString()} / day</div>
            </div>
            <div className="p-2.5 bg-navy-950 rounded-xl border border-navy-800">
              <div className="text-[10px] text-slate-400 font-sans uppercase">Speed & Consumption</div>
              <div className="text-sm font-bold text-emerald-400">{activeVesselModal.ecoSpeedKnots} kts • {activeVesselModal.fuelConsumptionTonsPerDay} MT/d</div>
            </div>
            <div className="p-2.5 bg-navy-950 rounded-xl border border-navy-800">
              <div className="text-[10px] text-slate-400 font-sans uppercase">ETA & Destination</div>
              <div className="text-sm font-bold text-sky-400">{activeVesselModal.destinationPort} ({activeVesselModal.etaDays}d)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
