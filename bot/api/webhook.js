const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPPORT_CHAT_ID = process.env.SUPPORT_CHAT_ID;
const MINIAPP_URL = process.env.MINIAPP_URL;
const MAIN_BOT_TOKEN = process.env.MAIN_BOT_TOKEN;

async function sendMessage(token, chatId, text, extra = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
  return res.json();
}

async function handleTelegramUpdate(update) {
  const message = update.message;
  if (!message) return;
  const chatId = message.chat.id;
  const text = message.text || '';
  if (text === '/start') {
    await sendMessage(MAIN_BOT_TOKEN, chatId,
      `⚡️ <b>Ласкаво просимо до GreenWay!</b>\n\n🔋 Мережа зарядних станцій для електромобілів\n\nНатисніть кнопку нижче, щоб відкрити карту станцій 👇`,
      { reply_markup: { inline_keyboard: [[{ text: '🗺 Відкрити GreenWay', web_app: { url: MINIAPP_URL } }]] } }
    );
  }
}

async function handleNotify(body) {
  const { userId, userName, connectorId, stationName, stationAddress } = body;
  const ticketText = `🎫 <b>Новий запит на зарядку</b>\n\n👤 Користувач: ${userName ? `@${userName}` : `ID: ${userId}`}\n🔌 Конектор: <b>${connectorId}</b>\n📍 Станція: <b>${stationName}</b>\n🏠 Адреса: ${stationAddress}\n🕐 Час: ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}`;
  const userConfirmText = `✅ <b>Ваш запит прийнято!</b>\n\n🔌 Конектор: <b>${connectorId}</b>\n📍 Станція: <b>${stationName}</b>\n🏠 Адреса: ${stationAddress}\n\n⏳ Очікуйте активації.`;
  await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, ticketText);
  if (userId) await sendMessage(MAIN_BOT_TOKEN, userId, userConfirmText);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.update_id !== undefined) { await handleTelegramUpdate(body); return res.status(200).json({ ok: true }); }
      if (body.userId !== undefined || body.connectorId !== undefined) { await handleNotify(body); return res.status(200).json({ ok: true }); }
      return res.status(400).json({ ok: false });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message }); }
  }
  if (req.method === 'GET') return res.status(200).json({ ok: true, message: 'GreenWay bot is alive' });
  return res.status(405).json({ ok: false });
}