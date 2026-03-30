import {
  init, mountMiniApp, miniAppReady, expandViewport, backButton,
  setMiniAppBackgroundColor, setMiniAppHeaderColor, bindThemeParamsCssVars,
} from '@telegram-apps/sdk-react';

function safe(fn) {
  try { if (fn.isAvailable?.()) fn(); else fn(); } catch {}
}

export function initTelegramApp(bgColor = '#FFFFFF', headerColor = '#FFFFFF') {
  const w = window.Telegram?.WebApp;
  if (w) { w.ready(); w.expand(); }
  try { init(); } catch {}
  safe(bindThemeParamsCssVars);
  safe(mountMiniApp);
  safe(miniAppReady);
  safe(expandViewport);
  if (setMiniAppBackgroundColor.isAvailable?.()) try { setMiniAppBackgroundColor(bgColor); } catch {}
  if (setMiniAppHeaderColor.isAvailable?.()) try { setMiniAppHeaderColor(headerColor); } catch {}
}

export function setupBackButton(onBack) {
  let off;
  if (backButton.mount.isAvailable?.()) try { backButton.mount(); } catch {}
  if (backButton.onClick.isAvailable?.()) try { off = backButton.onClick(onBack); } catch {}
  return () => { if (typeof off === 'function') off(); };
}

export function showBackButton() {
  if (backButton.show.isAvailable?.()) try { backButton.show(); } catch {}
}

export function hideBackButton() {
  if (backButton.hide.isAvailable?.()) try { backButton.hide(); } catch {}
}

export function getUserId() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
}

export function getUserName() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return '';
  return [user.first_name, user.last_name].filter(Boolean).join(' ');
}

export function getUserHandle() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null;
}

export function showTgPopup(title, message) {
  const tg = window.Telegram?.WebApp;
  if (tg?.showPopup) {
    tg.showPopup({ title, message, buttons: [{ type: 'ok' }] });
  } else {
    alert(`${title}\n${message}`);
  }
}