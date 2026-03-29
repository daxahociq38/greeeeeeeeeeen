const price = (n) => `${n.toFixed(2)} PLN/kWh`;

const RAW = [
  {
    id: 1, city: 'warsaw',
    name: 'Biurowiec Elektrownia Powiśle',
    address: 'Leszczyńska 2B, Warszawa',
    power: '140 kW', lat: 52.2432, lng: 21.0364,
    connectors: [
      { id: 1, type: 'CCS', power: '140 kW', price: price(2.79), status: 'Available' },
      { id: 2, type: 'CCS', power: '140 kW', price: price(2.79), status: 'Available' },
      { id: 3, type: 'CCS', power: '140 kW', price: price(2.89), status: 'Available' },
    ],
  },
  {
    id: 2, city: 'warsaw',
    name: 'Elektrownia Powiśle (P)',
    address: 'Powiśle, Warszawa',
    power: '6 kW', lat: 52.2418, lng: 21.0349,
    connectors: [
      { id: 1, type: 'Type 2', power: '6 kW', price: price(1.95), status: 'Available' },
    ],
  },
  {
    id: 3, city: 'warsaw',
    name: 'Galeria Wileńska',
    address: 'ul. Wileńska, Warszawa',
    power: '22 kW', lat: 52.2574, lng: 21.0435,
    connectors: [
      { id: 1, type: 'Type 2', power: '22 kW', price: price(2.35), status: 'Available' },
      { id: 2, type: 'Type 2', power: '22 kW', price: price(2.35), status: 'Available' },
      { id: 3, type: 'Type 2', power: '22 kW', price: price(2.45), status: 'Out Of Order' },
    ],
  },
  {
    id: 4, city: 'warsaw',
    name: 'Fabryka Norblina',
    address: 'ul. Żelazna, Warszawa',
    power: '150 kW', lat: 52.2331, lng: 21.0028,
    connectors: [
      { id: 1, type: 'CCS', power: '150 kW', price: price(2.92), status: 'Available' },
      { id: 2, type: 'CCS', power: '150 kW', price: price(2.92), status: 'Available' },
      { id: 3, type: 'CHAdeMO', power: '50 kW', price: price(2.65), status: 'Available' },
      { id: 4, type: 'Type 2', power: '22 kW', price: price(2.25), status: 'Available' },
    ],
  },
  {
    id: 5, city: 'warsaw',
    name: 'Volkswagen Krotoski',
    address: 'Krotoska, Warszawa',
    power: '25 kW', lat: 52.2189, lng: 20.9658,
    connectors: [
      { id: 1, type: 'Type 2', power: '25 kW', price: price(2.42), status: 'Available' },
      { id: 2, type: 'Type 2', power: '25 kW', price: price(2.42), status: 'Available' },
    ],
  },
  {
    id: 6, city: 'warsaw',
    name: 'Amic Warszawa Skargi',
    address: 'Piotra Skargi 3a, Warszawa',
    power: '140 kW', lat: 52.2924, lng: 21.0488,
    connectors: [
      { id: 1, type: 'CCS', power: '140 kW', price: price(2.81), status: 'Available' },
      { id: 2, type: 'CCS', power: '140 kW', price: price(2.81), status: 'Available' },
    ],
  },
  {
    id: 7, city: 'warsaw',
    name: 'Arkadia Warszawa',
    address: 'ul. Arkadia, Warszawa',
    power: '22 kW', lat: 52.2305, lng: 20.9842,
    connectors: [
      { id: 1, type: 'Type 2', power: '22 kW', price: price(2.28), status: 'Available' },
      { id: 2, type: 'Type 2', power: '22 kW', price: price(2.28), status: 'Available' },
      { id: 3, type: 'Type 2', power: '22 kW', price: price(2.28), status: 'Available' },
      { id: 4, type: 'Type 2', power: '22 kW', price: price(2.28), status: 'Out Of Order' },
    ],
  },
  {
    id: 8, city: 'warsaw',
    name: 'Atrium Promenada',
    address: 'ul. Promenada, Warszawa',
    power: '50 kW', lat: 52.2319, lng: 21.0957,
    operational: false,
    connectors: [
      { id: 1, type: 'CCS', power: '50 kW', price: price(2.55), status: 'Out Of Order' },
      { id: 2, type: 'CHAdeMO', power: '50 kW', price: price(2.55), status: 'Out Of Order' },
    ],
  },
  {
    id: 9, city: 'warsaw',
    name: 'Aldi Warszawa Łasaka',
    address: 'Łasaka, Warszawa',
    power: '11 kW', lat: 52.1781, lng: 20.9876,
    connectors: [
      { id: 1, type: 'Type 2', power: '11 kW', price: price(2.05), status: 'Available' },
    ],
  },
  {
    id: 10, city: 'warsaw',
    name: 'Wola Park Warszawa',
    address: 'Górczewska, Warszawa',
    power: '22 kW', lat: 52.2391, lng: 20.9279,
    connectors: [
      { id: 1, type: 'Type 2', power: '22 kW', price: price(2.22), status: 'Available' },
      { id: 2, type: 'Type 2', power: '22 kW', price: price(2.22), status: 'Available' },
    ],
  },
  {
    id: 11, city: 'warsaw',
    name: 'Atrium Reduta',
    address: 'ul. Reduta, Warszawa',
    power: '22 kW', lat: 52.2124, lng: 20.9558,
    connectors: [
      { id: 1, type: 'Type 2', power: '22 kW', price: price(2.2), status: 'Available' },
      { id: 2, type: 'Type 2', power: '22 kW', price: price(2.2), status: 'Available' },
      { id: 3, type: 'Type 2', power: '22 kW', price: price(2.2), status: 'Available' },
    ],
  },
  {
    id: 12, city: 'warsaw',
    name: 'Heliotropów 59',
    address: 'Heliotropów 59, Warszawa',
    power: '22 kW', lat: 52.2756, lng: 21.1762,
    connectors: [
      { id: 1, type: 'Type 2', power: '22 kW', price: price(2.18), status: 'Available' },
      { id: 2, type: 'Type 2', power: '22 kW', price: price(2.18), status: 'Available' },
    ],
  },
];

export const ALL_STATIONS = RAW.map((s) => {
  const list = s.connectors || [];
  const total = list.length;
  const avail = list.filter((c) => c.status === 'Available').length;
  const operational = s.operational !== false && avail > 0;
  return {
    ...s,
    operational,
    availableCount: avail,
    totalCount: total,
    available: operational ? `${avail}/${total}` : 'Недоступна',
    powerKw: parseInt(s.power) || 0,
  };
});
