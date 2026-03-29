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
  const data = await res.json();
  console.log("sendMessage:", JSON.stringify(data));
  return data;
}

module.exports = async function handler(req, res) {
  console.log("SUPPORT_CHAT_ID:", SUPPORT_CHAT_ID);
  console.log("Body:", JSON.stringify(req.body));

  if (req.method === "POST") {
    try {
      const body = req.body;

      if (body.update_id !== undefined) {
        const message = body.message;
        if (message && message.text === "/start") {
          await sendMessage(MAIN_BOT_TOKEN, message.chat.id,
            "⚡️ <b>Ласкаво просимо до GreenWay!</b>\n\nНатисніть кнопку нижче щоб відкрити карту станцій 👇",
            { reply_markup: { inline_keyboard: [[{ text: "🗺 Відкрити GreenWay", web_app: { url: MINIAPP_URL } }]] } }
          );
        }
        return res.status(200).json({ ok: true });
      }

      const userId = body.user_id || body.userId;
      const userName = body.user_name || body.userName;
      const stationName = body.station_name || body.stationName || "Unknown";
      const stationId = body.station_id || body.stationId || "";
      const connectorType = body.connector_type || body.connectorType || "";
      const connectorLabel = body.connector_label || body.connectorLabel || "";
      const connectorPower = body.connector_power || body.connectorPower || "";
      const price = body.price || "";
      const currency = body.currency || "PLN";
      const timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Warsaw" });

      const supportMessage =
        "<b>🔔 Новий квиток!</b>\n\n" +
        "👤 " + (userName || "невідомий") + " (ID: " + userId + ")\n" +
        "🏢 " + stationName + " (#" + stationId + ")\n" +
        "🔌 " + connectorType + " #" + connectorLabel + ", " + connectorPower + " кВт\n" +
        "💰 " + price + " " + currency + "\n" +
        "🕐 " + timestamp;

      await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);

      if (userId && userId !== "browser_user") {
        const userMsg =
          "<b>🎫 Ваш квиток на зарядку</b>\n\n" +
          "🏢 " + stationName + "\n" +
          "🔌 " + connectorType + " #" + connectorLabel + "\n" +
          "💰 " + price + " " + currency + "\n" +
          "🕐 " + timestamp + "\n\n" +
          "Напишіть @Greenway_Supp для оплати.";
        await sendMessage(MAIN_BOT_TOKEN, userId, userMsg);
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Error:", err.message);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (req.method === "GET") return res.status(200).json({ ok: true, message: "alive" });
  return res.status(405).json({ ok: false });
};