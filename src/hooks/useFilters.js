import { useCallback, useState } from 'react';

const INITIAL = {
  connectorTypes: [],   // empty = all
  minPower: 0,          // kW
  availableOnly: false,
  city: 'all',
};

export function useFilters() {
  const [filters, setFilters] = useState(INITIAL);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(INITIAL), []);

  const toggleConnectorType = useCallback((type) => {
    setFilters((prev) => {
      const types = prev.connectorTypes.includes(type)
        ? prev.connectorTypes.filter((t) => t !== type)
        : [...prev.connectorTypes, type];
      return { ...prev, connectorTypes: types };
    });
  }, []);

  const activeCount =
    (filters.connectorTypes.length > 0 ? 1 : 0) +
    (filters.minPower > 0 ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.city !== 'all' ? 1 : 0);

  const filterStations = useCallback(
    (stations) => {
      let result = stations;

      if (filters.city !== 'all') {
        result = result.filter((s) => s.city === filters.city);
      }

      if (filters.availableOnly) {
        result = result.filter((s) => s.operational);
      }

      if (filters.minPower > 0) {
        result = result.filter((s) => s.powerKw >= filters.minPower);
      }

      if (filters.connectorTypes.length > 0) {
        result = result.filter((s) =>
          // If connectors not loaded yet (map view), don't filter out
          s.connectors.length === 0 ||
          s.connectors.some((c) => filters.connectorTypes.includes(c.type))
        );
      }

      return result;
    },
    [filters]
  );

  return { filters, setFilter, resetFilters, toggleConnectorType, activeCount, filterStations };
}
