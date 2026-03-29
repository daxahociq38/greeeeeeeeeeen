/**
 * GreenWay Mini App — Flat pricing model
 *
 * Two tiers based on max station power:
 *   Standard (< 22 kW)  → 50 PLN flat per charging session
 *   Fast     (≥ 22 kW)  → 80 PLN flat per charging session
 */

export const FAST_THRESHOLD_KW = 22;

export const PRICING = {
  standard: { price: 50, label: '50 PLN', badgeLabel: '50 PLN / сеанс', tier: 'Standard', description: 'до 22 кВт' },
  fast:     { price: 80, label: '80 PLN', badgeLabel: '80 PLN / сеанс', tier: 'Fast',     description: '22 кВт и выше' },
};

export function getTier(powerKw) {
  return powerKw >= FAST_THRESHOLD_KW ? PRICING.fast : PRICING.standard;
}

export function getTierByStation(station) {
  return getTier(station.powerKw || 0);
}
