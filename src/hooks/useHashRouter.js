import { useCallback, useEffect, useState } from 'react';

function parseHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '/');
  const stationMatch = clean.match(/^\/station\/(\d+)$/);
  if (stationMatch) return { route: 'station', params: { id: Number(stationMatch[1]) } };
  if (clean === '/list') return { route: 'list', params: {} };
  if (clean === '/favorites') return { route: 'favorites', params: {} };
  return { route: 'home', params: {} };
}

export function useHashRouter() {
  const [state, setState] = useState(() => {
    // Support legacy ?station=N deep link
    const sp = new URLSearchParams(window.location.search);
    const stationParam = sp.get('station');
    if (stationParam) {
      const id = Number(stationParam);
      if (id > 0) {
        window.history.replaceState(null, '', window.location.pathname + `#/station/${id}`);
        return { route: 'station', params: { id } };
      }
    }
    // Check Telegram startapp param
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (startParam && /^\d+$/.test(startParam)) {
      window.location.hash = `#/station/${startParam}`;
      return { route: 'station', params: { id: Number(startParam) } };
    }
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    const onHash = () => setState(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((path) => {
    window.location.hash = path;
  }, []);

  const goBack = useCallback(() => {
    if (state.route === 'station') {
      navigate('#/');
    } else if (state.route !== 'home') {
      navigate('#/');
    }
  }, [state.route, navigate]);

  return { route: state.route, params: state.params, navigate, goBack };
}
