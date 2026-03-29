import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo, useEffect, useState } from 'react';
import { LocateIcon } from '../icons/index.jsx';
import { getTierByStation } from '../../constants/pricing.js';
import { useI18n } from '../../i18n/index.jsx';

function createMarkerIcon(operational) {
  return L.divIcon({
    html: `<div class="gw-marker${operational ? '' : ' gw-marker--unavailable'}"><span class="gw-marker__bolt">\u26A1</span></div>`,
    className: 'custom-neon-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

const userIcon = L.divIcon({
  html: '<div class="gw-marker-user"></div>',
  className: 'custom-neon-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function LocateMeControl({ userPosition, onRequestLocation, loading }) {
  const map = useMap();

  useEffect(() => {
    if (userPosition) {
      map.setView([userPosition.lat, userPosition.lng], 14, { animate: true });
    }
  }, [userPosition, map]);

  return (
    <button
      type="button"
      className={`gw-locate-btn ${userPosition ? 'gw-locate-btn--active' : ''}`}
      onClick={onRequestLocation}
      aria-label="Мое местоположение"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin block" />
      ) : (
        <LocateIcon size={22} />
      )}
    </button>
  );
}

function MapCenterSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 12, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ stations, center, zoom, onSelectStation, userPosition, onRequestLocation, geoLoading, navigate }) {
  const { t } = useI18n();
  const icons = useMemo(() => ({
    ok: createMarkerIcon(true),
    bad: createMarkerIcon(false),
  }), []);

  const defaultCenter = center || [52.23, 21.01];
  const defaultZoom = zoom || 12;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ minHeight: '100%' }}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapCenterSync center={center} zoom={zoom} />

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />
        )}

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={station.operational ? icons.ok : icons.bad}
            eventHandlers={{
              click: () => onSelectStation?.(station),
            }}
          >
            <Popup>
              {(() => {
                const tierData = getTierByStation(station);
                const fast = tierData.tier === 'Fast';
                return (
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>{station.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 8 }}>{station.address}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className={`gw-chip ${station.operational ? 'gw-chip--available' : 'gw-chip--unavailable'}`}>
                        <span className={`gw-dot ${station.operational ? 'gw-dot--available' : 'gw-dot--unavailable'}`} />
                        {station.available}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2E7D32' }}>{station.power}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span className={`gw-price-badge ${fast ? 'gw-price-badge--fast' : 'gw-price-badge--standard'}`}>
                        {t('priceBadge', { price: tierData.price })}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{t('fullCharge')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate?.(`#/station/${station.id}`)}
                      className="gw-btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                    >
                      {t('details')}
                    </button>
                  </div>
                );
              })()}
            </Popup>
          </Marker>
        ))}

        <LocateMeControl
          userPosition={userPosition}
          onRequestLocation={onRequestLocation}
          loading={geoLoading}
        />
      </MapContainer>
    </div>
  );
}
