import { useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { setupBackButton, showBackButton, hideBackButton } from '../../utils/telegramHelpers.js';
import TopBar from './TopBar.jsx';
import BottomTabs from './BottomTabs.jsx';
import HomeMap from '../screens/HomeMap.jsx';
import StationListScreen from '../screens/StationListScreen.jsx';
import StationDetail from '../screens/StationDetail.jsx';
import FavoritesScreen from '../screens/FavoritesScreen.jsx';
import FilterModal from '../shared/FilterModal.jsx';

export default function AppShell() {
  const { router, filterOpen } = useApp();
  const isDetail = router.route === 'station';

  useEffect(() => {
    const cleanup = setupBackButton(() => router.goBack());
    return cleanup;
  }, [router.goBack]);

  useEffect(() => {
    if (router.route === 'home') hideBackButton();
    else showBackButton();
  }, [router.route]);

  return (
    <div className="gw-app-shell">
      {!isDetail && <TopBar />}

      <main className={`gw-main ${isDetail ? 'gw-main--no-tabs gw-main--no-top' : ''}`}>
        {router.route === 'home' && <HomeMap />}
        {router.route === 'list' && <StationListScreen />}
        {router.route === 'station' && <StationDetail />}
        {router.route === 'favorites' && <FavoritesScreen />}
      </main>

      {!isDetail && <BottomTabs />}
      {filterOpen && <FilterModal />}
    </div>
  );
}
