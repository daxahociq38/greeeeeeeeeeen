import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { MapPinIcon, ListIcon, HeartIcon } from '../icons/index.jsx';

export default function BottomTabs() {
  const { router } = useApp();
  const { t } = useI18n();

  const TABS = [
    { route: 'home', label: t('tabMap'), Icon: MapPinIcon },
    { route: 'list', label: t('tabStations'), Icon: ListIcon },
    { route: 'favorites', label: t('tabFavorites'), Icon: HeartIcon },
  ];

  return (
    <nav className="gw-bottom-tabs">
      {TABS.map(({ route, label, Icon }) => (
        <button
          key={route}
          type="button"
          className={`gw-tab ${router.route === route ? 'gw-tab--active' : ''}`}
          onClick={() => router.navigate(`#/${route === 'home' ? '' : route}`)}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
