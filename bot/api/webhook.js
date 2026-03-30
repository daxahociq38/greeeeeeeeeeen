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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      let body = req.body;
      if (!body) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString());
      }

      console.log("Body:", JSON.stringify(body));

      if (body.update_id !== undefined) {
        const message = body.message;
        if (message && message.text === "/start") {
          await sendMessage(MAIN_BOT_TOKEN, message.chat.id,
            "Welcome to GreenWay! Press the button below to open the app.",
            { reply_markup: { inline_keyboard: [[{ text: "Open GreenWay", web_app: { url: MINIAPP_URL } }]] } }
          );
        }
        return res.status(200).json({ ok: true });
      }

      const userId = body.user_id || body.userId;
      const userName = body.user_name || body.userName;
      const userHandle = body.user_handle || body.userHandle;
      const stationName = body.station_name || body.stationName || "Unknown";
      const stationId = body.station_id || body.stationId || "";
      const connectorType = body.connector_type || body.connectorType || "";
      const connectorLabel = body.connector_label || body.connectorLabel || "";
      const connectorPower = body.connector_power || body.connectorPower || "";
      const price = body.price || "";
      const currency = body.currency || "PLN";
      const timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Warsaw" });

      // Build user identification line
      let userLine = "";
      if (userHandle) {
        userLine = "@" + userHandle + " (ID: " + userId + ")";
      } else if (userName) {
        userLine = userName + " (ID: " + userId + ")";
      } else if (userId) {
        userLine = "ID: " + userId + " (no username)";
      } else {
        userLine = "unknown user";
      }

      const supportMessage =
        "<b>New charging ticket!</b>\n\n" +
        "User: " + userLine + "\n" +
        "Station: " + stationName + " (#" + stationId + ")\n" +
        "Connector: " + connectorType + " #" + connectorLabel + ", " + connectorPower + " kW\n" +
        "Price: " + price + " " + currency + "\n" +
        "Time: " + timestamp;

      await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);

      if (userId) {
        const userMsg =
          "<b>Your charging ticket</b>\n\n" +
          "Station: " + stationName + "\n" +
          "Connector: " + connectorType + " #" + connectorLabel + "\n" +
          "Price: " + price + " " + currency + "\n" +
          "Time: " + timestamp + "\n\n" +
          "Contact @Greenway_Supp for payment.";
        try { await sendMessage(MAIN_BOT_TOKEN, userId, userMsg); } catch(e) { console.warn("Could not DM user:", e.message); }
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
