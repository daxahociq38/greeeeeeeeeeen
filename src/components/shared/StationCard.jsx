import { BoltIcon, HeartIcon, ChevronRightIcon } from '../icons/index.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { formatDistance } from '../../utils/distance.js';
import { getTierByStation } from '../../constants/pricing.js';

export default function StationCard({ station, isFavorite, onToggleFavorite, onTap, cachedPhoto }) {
  const { t } = useI18n();
  const tier = getTierByStation(station);
  const isFast = tier.tier === 'Fast';
  const photo = station.photo || cachedPhoto;

  return (
    <div className="gw-card gw-card--interactive flex items-center gap-3 px-3.5 py-3.5" onClick={onTap}>
      {photo ? (
        <img src={photo} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="gw-station-icon"><BoltIcon size={22} /></div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-[0.92rem] font-semibold leading-snug text-[var(--gw-text)] truncate">{station.name}</h3>
        <p className="text-xs text-[var(--gw-text-tertiary)] mt-0.5 truncate">{station.address}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`gw-chip ${station.operational ? 'gw-chip--available' : 'gw-chip--unavailable'}`}>
            <span className={`gw-dot ${station.operational ? 'gw-dot--available' : 'gw-dot--unavailable'}`} />
            {station.available}
          </span>
          <span className="text-[11px] font-bold text-[var(--gw-primary-dark)]">{station.power}</span>
          <span className={`gw-price-badge ${isFast ? 'gw-price-badge--fast' : 'gw-price-badge--standard'}`}>
            {t('priceBadge', { price: tier.price })}
          </span>
          {station.distance != null && (
            <span className="text-[11px] text-[var(--gw-text-tertiary)]">{formatDistance(station.distance)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          className={`gw-heart ${isFavorite ? 'gw-heart--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={isFavorite ? t('removeFavorite') : t('addFavorite')}
        >
          <HeartIcon size={20} filled={isFavorite} />
        </button>
        <ChevronRightIcon size={18} className="text-[var(--gw-text-tertiary)]" />
      </div>
    </div>
  );
}
