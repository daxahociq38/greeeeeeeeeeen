import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { XIcon } from '../icons/index.jsx';

const CONNECTOR_TYPES = ['CCS', 'Type 2', 'CHAdeMO'];

export default function FilterModal() {
  const { filters, setFilterOpen, allStations } = useApp();
  const { t } = useI18n();
  const { filters: f, setFilter, toggleConnectorType, resetFilters } = filters;

  const POWER_OPTIONS = [
    { label: t('filterPowerAny'), value: 0 },
    { label: '22+ kW', value: 22 },
    { label: '50+ kW', value: 50 },
    { label: '100+ kW', value: 100 },
    { label: '150+ kW', value: 150 },
  ];

  const cities = useMemo(() => {
    const counts = {};
    for (const s of allStations) {
      const c = s.city || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    }
    return [
      { id: 'all', label: t('filterAll', { count: allStations.length }) },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([city, count]) => ({ id: city, label: `${city} (${count})` })),
    ];
  }, [allStations, t]);

  const close = () => setFilterOpen(false);

  return (
    <>
      <div className="gw-modal-backdrop" onClick={close} />
      <div className="gw-modal-panel">
        <div className="gw-modal-handle" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--gw-text)]">{t('filtersTitle')}</h2>
          <button type="button" className="gw-btn-icon" onClick={close} aria-label={t('filtersClose')}>
            <XIcon size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="gw-section-title mb-3">{t('filterCity')}</h3>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`gw-chip gw-chip--filter ${f.city === city.id ? 'gw-chip--filter-active' : ''}`}
                onClick={() => setFilter('city', city.id)}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="gw-section-title mb-3">{t('filterConnectorType')}</h3>
          <div className="flex flex-wrap gap-2">
            {CONNECTOR_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`gw-chip gw-chip--filter ${f.connectorTypes.includes(type) ? 'gw-chip--filter-active' : ''}`}
                onClick={() => toggleConnectorType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="gw-section-title mb-3">{t('filterPower')}</h3>
          <div className="flex flex-wrap gap-2">
            {POWER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`gw-chip gw-chip--filter ${f.minPower === opt.value ? 'gw-chip--filter-active' : ''}`}
                onClick={() => setFilter('minPower', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={f.availableOnly}
              onChange={(e) => setFilter('availableOnly', e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--gw-primary)]"
            />
            <span className="text-sm font-medium text-[var(--gw-text)]">{t('filterAvailableOnly')}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="button" className="gw-btn-secondary flex-1" onClick={() => { resetFilters(); close(); }}>
            {t('filterReset')}
          </button>
          <button type="button" className="gw-btn-primary flex-1" onClick={close}>
            {t('filterApply')}
          </button>
        </div>
      </div>
    </>
  );
}
