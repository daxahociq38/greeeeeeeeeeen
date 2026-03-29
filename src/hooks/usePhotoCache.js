import { useCallback, useRef, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'gw_photo_cache';

/**
 * Persist station photo URLs in localStorage after first detail load.
 * Returns { getPhoto, setPhoto, version } so components can reactively
 * show cached photos on the list/map without extra API calls.
 */
export function usePhotoCache() {
  const storeRef = useRef(loadCache());
  const versionRef = useRef(0);
  const listenersRef = useRef(new Set());

  const subscribe = useCallback((cb) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  const getSnapshot = useCallback(() => versionRef.current, []);

  // Subscribe so components re-render when cache updates
  useSyncExternalStore(subscribe, getSnapshot);

  const getPhoto = useCallback((stationId) => {
    return storeRef.current[stationId] || null;
  }, []);

  const setPhoto = useCallback((stationId, url) => {
    if (!stationId || !url) return;
    if (storeRef.current[stationId] === url) return; // no change
    storeRef.current[stationId] = url;
    versionRef.current += 1;
    saveCache(storeRef.current);
    // Notify subscribers
    for (const cb of listenersRef.current) cb();
  }, []);

  return { getPhoto, setPhoto };
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}
