import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHashRouter } from '../hooks/useHashRouter.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useFilters } from '../hooks/useFilters.js';
import { usePhotoCache } from '../hooks/usePhotoCache.js';
import { haversineKm } from '../utils/distance.js';
import { fetchStations } from '../utils/greenwayApi.js';

const AppContext = createContext(null);

const POLL_INTERVAL = 15_000; // refresh every 15 seconds for near real-time accuracy

export function AppProvider({ children }) {
  const router = useHashRouter();
  const geo = useGeolocation();
  const favorites = useFavorites();
  const filtersHook = useFilters();
  const photoCache = usePhotoCache();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [allStations, setAllStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const lastFetchRef = useRef(0);

  const loadStations = useCallback(async () => {
    try {
      const data = await fetchStations();
      setAllStations(data);
      setError(null);
      lastFetchRef.current = Date.now();
    } catch (e) {
      console.error('Failed to fetch stations:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadStations();
    pollRef.current = setInterval(loadStations, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadStations]);

  // Refresh when user returns to the app/tab (visibility change)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if data is older than 10 seconds
        if (Date.now() - lastFetchRef.current > 10_000) {
          loadStations();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    // Also refresh when Telegram WebApp resumes
    const tg = window.Telegram?.WebApp;
    if (tg?.onEvent) {
      tg.onEvent('viewportChanged', onVisible);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (tg?.offEvent) tg.offEvent('viewportChanged', onVisible);
    };
  }, [loadStations]);

  // Filtered + sorted stations
  const stations = useMemo(() => {
    let result = filtersHook.filterStations(allStations);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    if (geo.position) {
      result = result
        .map((s) => ({
          ...s,
          distance: haversineKm(geo.position.lat, geo.position.lng, s.lat, s.lng),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [filtersHook, searchQuery, geo.position, allStations]);

  const findStation = useCallback(
    (id) => allStations.find((s) => s.id === id) || null,
    [allStations]
  );

  const value = {
    router,
    geo,
    favorites,
    filters: filtersHook,
    photoCache,
    searchQuery,
    setSearchQuery,
    filterOpen,
    setFilterOpen,
    stations,
    allStations,
    findStation,
    loading,
    error,
    refreshStations: loadStations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
