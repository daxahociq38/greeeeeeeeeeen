import { useCallback, useState } from 'react';

const STORAGE_KEY = 'gw_favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveFavorites(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* storage full or unavailable */ }
}

export function useFavorites() {
  const [ids, setIds] = useState(loadFavorites);

  const toggle = useCallback((stationId) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((stationId) => ids.has(stationId), [ids]);

  return { favoriteIds: ids, toggle, isFavorite };
}
