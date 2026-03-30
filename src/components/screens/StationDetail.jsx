import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { BoltIcon, HeartIcon, NavigateIcon, ArrowLeftIcon } from '../icons/index.jsx';
import SupportButton from '../shared/SupportButton.jsx';
import { openMapsNavigation } from '../../utils/openMapsApp.js';
import { getUserId, getUserName, showTgPopup } from '../../utils/telegramHelpers.js';
import { formatDistance, haversineKm } from '../../utils/distance.js';
import { fetchStationDetail } from '../../utils/greenwayApi.js';
import { getTierByStation, getTier } from '../../constants/pricing.js';
import pb from '../../src/pocketbase.js';

function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function StationDetail() {
  const { router, favorites, geo, findStation, refreshStations, photoCache } = useApp();
  const { t } = useI18n();
  const stationId = router.params.id;

  const basicStation = useMemo(() => findStation(stationId), [findStation, stationId]);

  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    if (!stationId) return;
    setLoadingDetail(true);
    setSelectedConnector(null);
    fetchStationDetail(stationId)
      .then((d) => {
        setDetail(d);
        if (d?.photo) photoCache.setPhoto(stationId, d.photo);
      })
      .catch((e) => console.error('Detail fetch error:', e))
      .finally(() => setLoadingDetail(false));
    refreshStations();
  }, [stationId, refreshStations]);

  const station = detail || basicStation;

  if (!station) {
    return (
      <div className="gw-empty min-h-dvh">
        <p className="gw-empty__text">{t('stationNotFound')}</p>
        <button type="button" className="gw-btn-secondary mt-4" onClick={() => router.navigate('#/')}>
          {t('goHome')}
        </button>
      </div>
    );
  }

  const isFav = favorites.isFavorite(station.id);
  const connectors = station.connectors || [];
  const tier = getTierByStation(station);
  const isFast = tier.tier === 'Fast';

  const distance = geo.position
    ? haversineKm(geo.position.lat, geo.position.lng, station.lat, station.lng)
    : null;

  const isConnectorAvailable = (c) => c.status === 'Available' || c.availability === 'available';
  const availableConnectors = connectors.filter(isConnectorAvailable);
  const hasAvailable = availableConnectors.length > 0;

  const selected = selectedConnector ? connectors.find((c) => c.id === selectedConnector) : null;
  const selectedIsStillAvailable = selected && isConnectorAvailable(selected);
  const selectedTier = selected ? getTier(selected.powerKw || 0) : tier;
  const canPay = selectedIsStillAvailable;

  const handleSelectConnector = (connector) => {
    if (!isConnectorAvailable(connector)) return;
    setSelectedConnector(selectedConnector === connector.id ? null : connector.id);
  };

  const handleActivate = async () => {
    if (!canPay || !selected) return;
    try {
      const activationData = {
        station_name: station.name,
        station_id: station.id,
        connector_id: selected.id,
        connector_type: selected.type,
        connector_label: selected.label,
        connector_power: selected.powerKw,
        price: selectedTier.price,
        currency: 'PLN',
        activated_at: new Date().toISOString(),
        user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null,
      };

      // Save to PocketBase (optional — skip if not configured)
      try {
        await pb.collection('activations').create(activationData);
      } catch (_) { /* PocketBase not available */ }

      // Send ticket to user + notify support via bot
      const notifyUrl = import.meta.env.VITE_BOT_NOTIFY_URL;
      if (notifyUrl) {
        await fetch(`${notifyUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...activationData, user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null, user_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null }
      setTicketSent(true);
      }

      const tg = window.Telegram?.WebApp;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink('https://t.me/Backendgreen_bot');
      } else {
        window.open('https://t.me/Backendgreen_bot', '_blank');
      }
    } catch (error) {
      console.error(error);
      showTgPopup(t('error'), t('chargingError'));
    }
  };

  let btnText;
  if (!hasAvailable) {
    btnText = t('noAvailableConnectors');
  } else if (!selected) {
    btnText = t('selectConnectorPrompt');
  } else if (!selectedIsStillAvailable) {
    btnText = t('connectorUnavailable');
  } else {
    btnText = t('payAndCharge', { price: t('priceLabel', { price: selectedTier.price }) });
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--gw-bg)]">
      <div className="absolute top-3 left-3 z-10">
        <button type="button" className="gw-back-btn shadow-sm" onClick={() => router.goBack()}>
          <ArrowLeftIcon size={18} />
          {t('back')}
        </button>
      </div>

      {/* Hero */}
      <div className="gw-detail-hero pt-14">
        {station.photo ? (
          <img src={station.photo} alt={station.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
        ) : (
          <div className="gw-detail-hero__icon"><BoltIcon size={36} /></div>
        )}
        <h1 className="text-xl font-bold leading-tight text-[var(--gw-text)] mt-2">{station.name}</h1>
        <p className="text-sm text-[var(--gw-text-secondary)] mt-2">
          {station.address}{station.city ? `, ${station.city}` : ''}
        </p>
        {distance != null && (
          <p className="text-xs text-[var(--gw-primary-dark)] font-semibold mt-2">
            {t('fromYou', { distance: formatDistance(distance) })}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <span className={`gw-chip ${hasAvailable ? 'gw-chip--available' : 'gw-chip--unavailable'}`}>
            <span className={`gw-dot ${hasAvailable ? 'gw-dot--available' : 'gw-dot--unavailable'}`} />
            {station.available}
          </span>
          <span className="gw-chip gw-chip--info">{station.power}</span>
          {station.is24h && <span className="gw-chip gw-chip--info">24/7</span>}
        </div>
      </div>

      {/* Pricing Banner */}
      <div className="gw-pricing-banner mt-4">
        <div className="shrink-0 text-center">
          <div className="gw-pricing-banner__price">{tier.price}<span className="gw-pricing-banner__unit"> PLN</span></div>
          <div className="text-[0.6rem] font-bold text-[var(--gw-primary-dark)] uppercase tracking-wider mt-0.5">{t('sessionLabel')}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--gw-text)]">{t('pricingTitle')}</div>
          <div className="gw-pricing-banner__info mt-0.5">
            {isFast ? t('pricingFast') : t('pricingStandard')}
          </div>
          <div className="text-[0.7rem] text-[var(--gw-primary-dark)] font-semibold mt-1">
            {t('pricingBenefits')}
          </div>
        </div>
      </div>

      {station.accessInstructions && (
        <p className="text-xs text-[var(--gw-text-tertiary)] mt-3 px-5 leading-relaxed">{station.accessInstructions}</p>
      )}

      {/* Action buttons */}
      <div className="gw-detail-actions">
        <button type="button" className="gw-detail-action-btn" onClick={() => openMapsNavigation(station.lat, station.lng, station.name)}>
          <NavigateIcon size={22} />
          {t('navigate')}
        </button>
        <button
          type="button"
          className={`gw-detail-action-btn ${isFav ? 'gw-detail-action-btn--active' : ''}`}
          onClick={() => favorites.toggle(station.id)}
        >
          <HeartIcon size={22} filled={isFav} />
          {isFav ? t('inFavorites') : t('favorite')}
        </button>
        <SupportButton variant="compact" />
      </div>

      {/* Connectors */}
      <div className="px-5 pb-28">
        <h2 className="gw-section-title mb-1.5">{t('selectConnector')}</h2>
        <p className="text-[0.72rem] text-[var(--gw-text-tertiary)] mb-3">{t('selectConnectorHint')}</p>
        {loadingDetail && connectors.length === 0 ? (
          <p className="text-sm text-[var(--gw-text-tertiary)] text-center py-6">{t('loading')}</p>
        ) : connectors.length === 0 ? (
          <p className="text-sm text-[var(--gw-text-tertiary)] text-center py-6">{t('noConnectorData')}</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {connectors.map((c) => {
              const isAvail = isConnectorAvailable(c);
              const isOccupied = c.status === 'Occupied' || c.availability === 'occupied';
              const isSelected = selectedConnector === c.id;
              const connectorTier = getTier(c.powerKw || 0);

              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!isAvail}
                  onClick={() => handleSelectConnector(c)}
                  className={`gw-connector text-left transition-all ${
                    isAvail ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  } ${isSelected ? 'ring-2 ring-[var(--gw-primary)] border-[var(--gw-primary)] bg-[var(--gw-primary-50)]' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[var(--gw-primary)] border-[var(--gw-primary)] text-white'
                        : isAvail
                          ? 'border-[var(--gw-border)] bg-white'
                          : 'border-[var(--gw-border-light)] bg-[var(--gw-bg)]'
                    }`}>
                      {isSelected && <CheckIcon size={12} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--gw-text)]">
                        {c.type}
                        <span className="text-[var(--gw-text-tertiary)] font-normal ml-1.5">#{c.label}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--gw-text-secondary)]">{c.power}</span>
                        <span className={`gw-price-badge text-[0.65rem] ${connectorTier.tier === 'Fast' ? 'gw-price-badge--fast' : 'gw-price-badge--standard'}`}>
                          {t('priceLabel', { price: connectorTier.price })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`gw-chip ${isAvail ? 'gw-chip--available' : isOccupied ? 'gw-chip--limited' : 'gw-chip--unavailable'}`}>
                      {isAvail ? t('connectorAvailable') : isOccupied ? t('connectorOccupied') : t('connectorOutOfOrder')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment button / Thank you screen */}
      {ticketSent ? (
        <div className="gw-bottom-action" style={{display:'flex',flexDirection:'column',gap:'12px',paddingBottom:'24px'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'32px'}}>✅</div>
            <div style={{fontWeight:'700',fontSize:'16px',marginTop:'8px'}}>Квиток надіслано!</div>
            <div style={{fontSize:'13px',color:'#666',marginTop:'4px'}}>Зверніться до підтримки для оплати</div>
          </div>
          <button type="button" className="gw-btn-primary" onClick={() => {
            const tg = window.Telegram?.WebApp;
            if (tg?.openTelegramLink) tg.openTelegramLink('https://t.me/Greenway_Supp');
            else window.open('https://t.me/Greenway_Supp', '_blank');
          }}>
            💬 Написати в підтримку
          </button>
        </div>
      ) : (
        <div className="gw-bottom-action">
          <button type="button" disabled={!canPay} onClick={handleActivate} className="gw-btn-primary">
            <BoltIcon size={20} />
            {btnText}
          </button>
        </div>
      )}
    </div>
  );
}
      <div className="gw-bottom-action">
        <button type="button" disabled={!canPay} onClick={handleActivate} className="gw-btn-primary">
          <BoltIcon size={20} />
          {btnText}
        </button>
      </div>
    </div>
  );
}
