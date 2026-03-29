import { useEffect, useState } from 'react';
import { initTelegramApp } from './utils/telegramHelpers.js';
import { AppProvider } from './context/AppContext.jsx';
import { I18nProvider } from './i18n/index.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Preloader from './components/shared/Preloader.jsx';

const PRELOADER_MS = 1500;

function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    initTelegramApp('#FFFFFF', '#FFFFFF');
    const t = setTimeout(() => setBooted(true), PRELOADER_MS);
    return () => clearTimeout(t);
  }, []);

  if (!booted) return <Preloader />;

  return (
    <I18nProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
