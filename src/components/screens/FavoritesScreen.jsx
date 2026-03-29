import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { HeartIcon } from '../icons/index.jsx';
import StationCard from '../shared/StationCard.jsx';
import SupportButton from '../shared/SupportButton.jsx';

export default function FavoritesScreen() {
  const { allStations, favorites, router, geo, photoCache } = useApp();
  const { t } = useI18n();

  const favStations = useMemo(() => {
    return allStations.filter((s) => favorites.isFavorite(s.id));
  }, [allStations, favorites.favoriteIds]);

  if (favStations.length === 0) {
    return (
      <div className="gw-empty flex-1">
        <HeartIcon size={48} className="gw-empty__icon" />
        <p className="gw-empty__text">{t('noFavorites')}</p>
        <div className="mt-6 w-full max-w-[260px]">
          <SupportButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-3 shrink-0">
        <p className="text-xs font-semibold text-[var(--gw-text-secondary)]">
          {t('favoritesCount', { count: favStations.length })}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4">
        <div className="flex flex-col gap-3">
          {favStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              isFavorite
              onToggleFavorite={() => favorites.toggle(station.id)}
              onTap={() => router.navigate(`#/station/${station.id}`)}
              cachedPhoto={photoCache.getPhoto(station.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
