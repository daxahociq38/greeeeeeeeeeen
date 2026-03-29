// In dev, Vite proxy handles CORS. In prod, call the API directly.
const isDev = import.meta.env.DEV;
const BASE = isDev ? '/gw-api' : 'https://api.greenwaypolska.pl/api';
const HEADERS = { Accept: 'application/json' };

const CONNECTOR_TYPE_MAP = {
  ConnectorType_CCS: 'CCS',
  ConnectorType_CHAdeMO: 'CHAdeMO',
  'ConnectorType_Type 2': 'Type 2',
  ConnectorType_Type2: 'Type 2',
  ConnectorType_Type1: 'Type 1',
  ConnectorType_Schuko: 'Schuko',
};

const STATUS_MAP = {
  ConnectorStatus_Available: 'Available',
  ConnectorStatus_Occupied: 'Occupied',
  ConnectorStatus_OutOfOrder: 'Out Of Order',
  ConnectorStatus_Unavailable: 'Unavailable',
  ConnectorStatus_Reserved: 'Reserved',
  ConnectorStatus_Unknown: 'Unknown',
};

function parseConnectorType(raw) {
  return CONNECTOR_TYPE_MAP[raw] || raw?.replace('ConnectorType_', '') || 'Unknown';
}

function parseStatus(raw) {
  return STATUS_MAP[raw] || raw?.replace('ConnectorStatus_', '') || 'Unknown';
}

/**
 * Fetch all stations visible in a map area.
 * Returns normalized station objects for the app.
 */
export async function fetchStations(lat = 51.9, lng = 19.1, spanLat = 5.0, spanLng = 8.0) {
  const url = `${BASE}/location/map?latitude=${lat}&longitude=${lng}&spanLat=${spanLat}&spanLng=${spanLng}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : raw.data || [];

  return list.map((s) => {
    const total = s.total || 0;
    const avail = s.available || 0;
    const operational = s.availability === 'available' || s.availability === 'occupied';
    return {
      id: s.location_id,
      name: s.name || '',
      address: [s.street, s.house_number].filter(Boolean).join(' ').trim() || '',
      city: (s.city || '').trim(),
      lat: s.latitude,
      lng: s.longitude,
      power: `${s.max_power || 0} kW`,
      powerKw: s.max_power || 0,
      totalCount: total,
      availableCount: avail,
      available: operational ? `${avail}/${total}` : 'Недоступна',
      operational,
      availability: s.availability,
      ownerType: s.owner_type,
      connectors: [], // loaded on demand via fetchStationDetail
    };
  });
}

/**
 * Fetch full station detail including devices/connectors.
 */
export async function fetchStationDetail(locationId) {
  const url = `${BASE}/location/${locationId}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const d = await res.json();

  const connectors = [];
  const devices = d.devices || [];
  for (const device of devices) {
    for (const c of device.connectors || []) {
      connectors.push({
        id: c.connector_id,
        label: c.printed_label || String(connectors.length + 1),
        type: parseConnectorType(c.type),
        power: `${c.max_power || 0} kW`,
        powerKw: c.max_power || 0,
        status: parseStatus(c.status),
        availability: c.availability,
        price: c.price
          ? `${c.price.priceKwh} ${c.price.currency}/kWh`
          : '',
        bestPrice: c.best_price
          ? `${c.best_price.priceKwh} ${c.best_price.currency}/kWh`
          : '',
      });
    }
  }

  return {
    id: d.location_id,
    name: d.name,
    address: [d.street, d.house_number].filter(Boolean).join(' ').trim(),
    city: d.city,
    lat: d.latitude,
    lng: d.longitude,
    power: `${d.max_power || Math.max(...connectors.map((c) => c.powerKw), 0)} kW`,
    powerKw: d.max_power || 0,
    totalCount: d.total || 0,
    availableCount: d.available || 0,
    available: d.availability === 'available' || d.availability === 'occupied'
      ? `${d.available}/${d.total}`
      : 'Недоступна',
    operational: d.availability === 'available' || d.availability === 'occupied',
    availability: d.availability,
    ownerType: d.owner_type,
    accessInstructions: d.access_instructions,
    is24h: d.twenty_four_seven,
    openNow: d.open_now,
    photo: d.default_photo || null,
    connectors,
  };
}
