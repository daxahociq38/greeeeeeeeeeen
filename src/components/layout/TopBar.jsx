import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { BoltIcon, FilterIcon } from '../icons/index.jsx';
import SearchBar from '../shared/SearchBar.jsx';

export default function TopBar() {
  const { filters, setFilterOpen } = useApp();
  const { t } = useI18n();

  return (
    <header className="gw-top-bar">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[var(--gw-primary)] flex items-center justify-center">
          <BoltIcon size={16} className="text-white" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-[var(--gw-text)]">
          {t('appName')}
        </span>
      </div>

      <SearchBar />

      <button
        type="button"
        className="gw-btn-icon relative"
        onClick={() => setFilterOpen(true)}
        aria-label={t('filtersLabel')}
      >
        <FilterIcon size={20} />
        {filters.activeCount > 0 && (
          <span className="gw-filter-badge">{filters.activeCount}</span>
        )}
      </button>
    </header>
  );
}
