import { useI18n } from '../../i18n/index.jsx';
import { ChatIcon } from '../icons/index.jsx';

const SUPPORT_BOT = 'greenway_support';

function openSupportChat() {
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/${SUPPORT_BOT}`);
  } else {
    window.open(`https://t.me/${SUPPORT_BOT}`, '_blank');
  }
}

/**
 * variant="full" — wide button with icon + text (for detail page)
 * variant="compact" — small icon-only (for floating)
 */
export default function SupportButton({ variant = 'full' }) {
  const { t } = useI18n();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={openSupportChat}
        className="gw-detail-action-btn"
        aria-label={t('support')}
      >
        <ChatIcon size={22} />
        {t('support')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSupportChat}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[var(--gw-border-light)] bg-[var(--gw-bg)] text-[var(--gw-text-secondary)] text-sm font-medium transition-colors hover:border-[var(--gw-primary)] hover:text-[var(--gw-primary-dark)]"
    >
      <ChatIcon size={18} />
      {t('supportHint')}
    </button>
  );
}
