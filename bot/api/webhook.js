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

async function handleNotify(body) {
  const userId = body.user_id || body.userId;
  const userName = body.user_name || body.userName;
  const stationName = body.station_name || body.stationName;
  const stationId = body.station_id || body.stationId;
  const connectorType = body.connector_type || body.connectorType;
  const connectorLabel = body.connector_label || body.connectorLabel;
  const connectorPower = body.connector_power || body.connectorPower;
  const price = body.price;
  const currency = body.currency || "PLN";
  const timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Warsaw" });

  const userTicket = "<b>Ваш квиток на зарядку</b>\n\n" +
    "Станція: " + stationName + "\n" +
    "Конектор: " + connectorType + " #" + connectorLabel + ", " + connectorPower + " кВт\n" +
    "До оплати: " + price + " " + currency + "\n" +
    "Час: " + timestamp + "\n\n" +
    "Напишіть @Greenway_Supp для оплати.";

  const supportMessage = "<b>Новий квиток!</b>\n\n" +
    "Користувач: " + (userName || "невідомий") + " (ID: " + userId + ")\n" +
    "Станція: " + stationName + " (#" + stationId + ")\n" +
    "Конектор: " + connectorType + " #" + connectorLabel + ", " + connectorPower + " кВт\n" +
    "Ціна: " + price + " " + currency + "\n" +
    "Час: " + timestamp;

  if (userId && userId !== "browser_user") {
    try { await sendMessage(MAIN_BOT_TOKEN, userId, userTicket); } catch(e) {}
  }
  if (SUPPORT_CHAT_ID) {
    await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);
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
      if (body.user_id !== undefined || body.userId !== undefined || body.station_name !== undefined) {
        await handleNotify(body);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok: false, error: "Unknown body" });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
  if (req.method === "GET") return res.status(200).json({ ok: true, message: "GreenWay bot is alive" });
  return res.status(405).json({ ok: false });
};