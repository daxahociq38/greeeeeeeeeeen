const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPPORT_CHAT_ID = process.env.SUPPORT_CHAT_ID;
const MINIAPP_URL = process.env.MINIAPP_URL;
const MAIN_BOT_TOKEN = process.env.MAIN_BOT_TOKEN;

async function sendMessage(token, chatId, text, extra) {
  extra = extra || {};
  const res = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.assign({ chat_id: chatId, text: text, parse_mode: "HTML" }, extra)),
  });
  return res.json();
}

async function handleTelegramUpdate(update) {
  const message = update.message;
  if (!message) return;
  const chatId = message.chat.id;
  const text = message.text || "";
  if (text === "/start") {
    await sendMessage(MAIN_BOT_TOKEN, chatId, "Welcome to GreenWay!", {
      reply_markup: { inline_keyboard: [[{ text: "Open GreenWay", web_app: { url: MINIAPP_URL } }]] }
    });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = req.body;
      if (body.update_id !== undefined) {
        await handleTelegramUpdate(body);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok: false });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
  if (req.method === "GET") return res.status(200).json({ ok: true, message: "GreenWay bot is alive" });
  return res.status(405).json({ ok: false });
};