import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import StationCard from '../shared/StationCard.jsx';

export default function StationListScreen() {
  const { stations, router, favorites, geo, filters, photoCache } = useApp();
  const { t } = useI18n();

  const activeFilters = [];
  if (filters.filters.city !== 'all') activeFilters.push(filters.filters.city);
  if (filters.filters.availableOnly) activeFilters.push(t('available'));
  if (filters.filters.minPower > 0) activeFilters.push(`${filters.filters.minPower}+ кВт`);
  filters.filters.connectorTypes.forEach((ct) => activeFilters.push(ct));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {activeFilters.length > 0 && (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto shrink-0 border-b border-[var(--gw-border-light)]">
          {activeFilters.map((f) => (
            <span key={f} className="gw-chip gw-chip--info whitespace-nowrap">{f}</span>
          ))}
          <button
            type="button"
            className="text-xs font-semibold text-[var(--gw-danger)] whitespace-nowrap px-2"
            onClick={filters.resetFilters}
          >
            {t('resetFilters')}
          </button>
        </div>
      )}

      <div className="px-4 py-3 shrink-0">
        <p className="text-xs font-semibold text-[var(--gw-text-secondary)]">
          {stations.length === 1 ? t('stationCountOne', { count: stations.length }) : t('stationCount', { count: stations.length })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4">
        {stations.length === 0 ? (
          <div className="gw-empty">
            <p className="gw-empty__text">{t('noStationsFound')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isFavorite={favorites.isFavorite(station.id)}
                onToggleFavorite={() => favorites.toggle(station.id)}
                onTap={() => router.navigate(`#/station/${station.id}`)}
                cachedPhoto={photoCache.getPhoto(station.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
