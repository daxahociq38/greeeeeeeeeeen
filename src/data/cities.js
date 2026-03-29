// Map center coordinates for known cities
export const CITY_CENTERS = {
  all: { lat: 51.9, lng: 19.1, zoom: 6 },
  Warszawa: { lat: 52.23, lng: 21.01, zoom: 12 },
  'Łódź': { lat: 51.76, lng: 19.46, zoom: 12 },
  Kraków: { lat: 50.06, lng: 19.94, zoom: 12 },
  Wrocław: { lat: 51.11, lng: 17.04, zoom: 12 },
  Katowice: { lat: 50.26, lng: 19.02, zoom: 12 },
  Bydgoszcz: { lat: 53.12, lng: 18.01, zoom: 12 },
};

export function getCityCenter(cityFilter) {
  if (!cityFilter || cityFilter === 'all') return CITY_CENTERS.all;
  return CITY_CENTERS[cityFilter] || { lat: 51.9, lng: 19.1, zoom: 7 };
}
