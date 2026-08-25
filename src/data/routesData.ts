import { Route } from '../types';

export const MARITIME_ROUTES: Route[] = [
  {
    id: 'ROUTE-AU-PARADIP',
    name: 'Australia (Hay Point/Gladstone) → Paradip',
    loadPort: 'Hay Point / Gladstone',
    loadCountry: 'Australia',
    dischargePort: 'Paradip',
    dischargeRegion: 'East Coast India',
    distanceNM: 4850,
    typicalVoyageDays: 16,
    canalTransit: 'Direct',
    maxDraftDischarge: 17.5,
    allowedVesselClasses: ['Capesize', 'Post-Panamax', 'Kamsarmax', 'Panamax'],
    primaryCommodities: ['Coking Coal', 'Thermal Coal'],
    coordinates: {
      load: [-21.28, 149.30], // Hay Point, Australia
      discharge: [20.26, 86.67], // Paradip, India
      waypoints: [
        [-10.60, 142.20], // Torres Strait / North Passage
        [-5.90, 105.75], // Sunda Strait / Malacca
        [5.80, 95.20], // Great Channel / Andaman Sea
        [15.00, 89.00], // Bay of Bengal
      ]
    }
  },
  {
    id: 'ROUTE-AU-VIZAG',
    name: 'Australia (Port Hedland/Dampier) → Visakhapatnam',
    loadPort: 'Port Hedland',
    loadCountry: 'Australia',
    dischargePort: 'Visakhapatnam (Vizag)',
    dischargeRegion: 'East Coast India',
    distanceNM: 3950,
    typicalVoyageDays: 13,
    canalTransit: 'Direct',
    maxDraftDischarge: 18.0,
    allowedVesselClasses: ['Capesize', 'Post-Panamax', 'Kamsarmax', 'Panamax'],
    primaryCommodities: ['Iron Ore', 'Coking Coal'],
    coordinates: {
      load: [-20.31, 118.57], // Port Hedland
      discharge: [17.68, 83.29], // Vizag
      waypoints: [
        [-8.50, 115.50], // Lombok Strait
        [5.50, 95.00], // North Sumatra Passage
        [12.00, 87.00], // Central Bay of Bengal
      ]
    }
  },
  {
    id: 'ROUTE-ID-KRISHNA',
    name: 'Indonesia (Taboneo/Balikpapan) → Krishnapatnam',
    loadPort: 'Taboneo Anchorage',
    loadCountry: 'Indonesia',
    dischargePort: 'Krishnapatnam',
    dischargeRegion: 'East Coast India',
    distanceNM: 2150,
    typicalVoyageDays: 7,
    canalTransit: 'Direct',
    maxDraftDischarge: 18.5,
    allowedVesselClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Supramax'],
    primaryCommodities: ['Thermal Coal'],
    coordinates: {
      load: [-3.75, 114.45], // Taboneo
      discharge: [14.25, 80.12], // Krishnapatnam
      waypoints: [
        [-5.95, 105.80], // Sunda Strait
        [5.50, 95.10], // Malacca entrance
        [10.00, 84.00], // Bay of Bengal approaches
      ]
    }
  },
  {
    id: 'ROUTE-ID-ENNORE',
    name: 'Indonesia (Muara Pantai) → Kamarajar (Ennore)',
    loadPort: 'Muara Pantai',
    loadCountry: 'Indonesia',
    dischargePort: 'Kamarajar (Ennore)',
    dischargeRegion: 'East Coast India',
    distanceNM: 2300,
    typicalVoyageDays: 8,
    canalTransit: 'Direct',
    maxDraftDischarge: 16.0,
    allowedVesselClasses: ['Kamsarmax', 'Panamax', 'Supramax'],
    primaryCommodities: ['Thermal Coal'],
    coordinates: {
      load: [2.15, 117.70], // Muara Pantai, Berau
      discharge: [13.25, 80.33], // Ennore
      waypoints: [
        [1.25, 103.80], // Singapore Strait
        [5.75, 95.25], // Great Channel
        [11.50, 82.50], // Approaches to Chennai/Ennore
      ]
    }
  },
  {
    id: 'ROUTE-ZA-VIZAG',
    name: 'South Africa (Richards Bay) → Visakhapatnam / Gangavaram',
    loadPort: 'Richards Bay',
    loadCountry: 'South Africa',
    dischargePort: 'Visakhapatnam (Vizag)',
    dischargeRegion: 'East Coast India',
    distanceNM: 4780,
    typicalVoyageDays: 16,
    canalTransit: 'Cape of Good Hope',
    maxDraftDischarge: 18.0,
    allowedVesselClasses: ['Capesize', 'Post-Panamax', 'Kamsarmax', 'Panamax'],
    primaryCommodities: ['Thermal Coal', 'Steam Coal'],
    coordinates: {
      load: [-28.78, 32.03], // Richards Bay
      discharge: [17.68, 83.29], // Vizag
      waypoints: [
        [-20.00, 45.00], // Mozambique Channel
        [-4.00, 65.00], // Central Indian Ocean
        [6.00, 80.00], // South of Sri Lanka (Dondra Head)
        [14.00, 82.50], // ECI Approaches
      ]
    }
  },
  {
    id: 'ROUTE-BR-PARADIP',
    name: 'Brazil (Tubarao/Ponta da Madeira) → Paradip',
    loadPort: 'Ponta da Madeira',
    loadCountry: 'Brazil',
    dischargePort: 'Paradip',
    dischargeRegion: 'East Coast India',
    distanceNM: 10450,
    typicalVoyageDays: 34,
    canalTransit: 'Cape of Good Hope',
    maxDraftDischarge: 17.5,
    allowedVesselClasses: ['Capesize', 'Post-Panamax'],
    primaryCommodities: ['Iron Ore', 'Pellets'],
    coordinates: {
      load: [-2.55, -44.36], // Ponta da Madeira
      discharge: [20.26, 86.67], // Paradip
      waypoints: [
        [-15.00, -25.00], // South Atlantic
        [-34.50, 18.50], // Cape of Good Hope
        [-25.00, 55.00], // South Indian Ocean
        [6.00, 80.00], // Sri Lanka South
        [16.00, 85.00], // Bay of Bengal
      ]
    }
  },
  {
    id: 'ROUTE-US-HALDIA',
    name: 'USA Gulf (Mobile / New Orleans) → Haldia / Kolkata',
    loadPort: 'Mobile / New Orleans',
    loadCountry: 'USA',
    dischargePort: 'Haldia',
    dischargeRegion: 'East Coast India',
    distanceNM: 9800,
    typicalVoyageDays: 32,
    canalTransit: 'Suez',
    maxDraftDischarge: 12.5, // Draft restricted
    allowedVesselClasses: ['Supramax', 'Handysize', 'Panamax'],
    primaryCommodities: ['Petcoke', 'Metallurgical Coke'],
    coordinates: {
      load: [30.25, -88.05], // Mobile, AL
      discharge: [22.02, 88.06], // Haldia
      waypoints: [
        [36.00, -5.35], // Gibraltar Strait
        [31.25, 32.30], // Port Said / Suez
        [12.50, 43.30], // Bab-el-Mandeb
        [6.00, 80.00], // Sri Lanka
        [21.00, 88.00], // Sandheads / Hooghly estuary
      ]
    }
  },
  {
    id: 'ROUTE-AE-CHENNAI',
    name: 'UAE (Mina Saqr) → Chennai / Kamarajar',
    loadPort: 'Mina Saqr (Ras Al Khaimah)',
    loadCountry: 'United Arab Emirates',
    dischargePort: 'Chennai',
    dischargeRegion: 'East Coast India',
    distanceNM: 2200,
    typicalVoyageDays: 7.5,
    canalTransit: 'Direct',
    maxDraftDischarge: 16.5,
    allowedVesselClasses: ['Supramax', 'Panamax', 'Kamsarmax'],
    primaryCommodities: ['Limestone', 'Gypsum', 'Aggregates'],
    coordinates: {
      load: [25.98, 56.02], // Mina Saqr
      discharge: [13.08, 80.30], // Chennai
      waypoints: [
        [24.00, 59.00], // Gulf of Oman
        [15.00, 68.00], // Arabian Sea
        [6.00, 79.50], // South Sri Lanka
        [12.00, 81.00], // Coromandel Coast
      ]
    }
  }
];
