import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { getCityCenter } from '../../data/cities.js';
import MapView from '../shared/MapView.jsx';

export default function HomeMap() {
  const { stations, filters, geo, router, loading } = useApp();
  const { t } = useI18n();

  const cityData = useMemo(() => {
    const c = getCityCenter(filters.filters.city);
    return { center: [c.lat, c.lng], zoom: c.zoom };
  }, [filters.filters.city]);

  return (
    <div style={{ height: 'calc(100dvh - var(--gw-top-bar-h) - var(--gw-bottom-tabs-h) - var(--gw-safe-bottom))' }}>
      {loading && stations.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[var(--gw-text-tertiary)]">{t('loadingStations')}</p>
        </div>
      ) : (
        <MapView
          stations={stations}
          center={cityData.center}
          zoom={cityData.zoom}
          userPosition={geo.position}
          onRequestLocation={geo.requestLocation}
          geoLoading={geo.loading}
          navigate={router.navigate}
        />
      )}
    </div>
  );
}
