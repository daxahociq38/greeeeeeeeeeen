const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPPORT_CHAT_ID = process.env.SUPPORT_CHAT_ID;
const MINIAPP_URL = process.env.MINIAPP_URL;
const MAIN_BOT_TOKEN = process.env.MAIN_BOT_TOKEN;

async function sendMessage(token, chatId, text) {
  const res = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "HTML" }),
  });
  const json = await res.json();
  console.log("sendMessage result:", JSON.stringify(json));
  return json;
}

module.exports = async function handler(req, res) {
  console.log("METHOD:", req.method);
  console.log("BODY:", JSON.stringify(req.body));
  console.log("BOT_TOKEN exists:", !!BOT_TOKEN);
  console.log("SUPPORT_CHAT_ID:", SUPPORT_CHAT_ID);
  console.log("MAIN_BOT_TOKEN exists:", !!MAIN_BOT_TOKEN);

  if (req.method === "POST") {
    try {
      const body = req.body;

      if (body.update_id !== undefined) {
        const message = body.message;
        if (message && message.text === "/start") {
          await sendMessage(MAIN_BOT_TOKEN, message.chat.id, "Welcome to GreenWay!");
        }
        return res.status(200).json({ ok: true });
      }

      console.log("Processing notify...");
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

      const supportMessage = "New ticket!\n\nUser: " + (userName || "unknown") + " (ID: " + userId + ")\nStation: " + stationName + " (#" + stationId + ")\nConnector: " + connectorType + " #" + connectorLabel + ", " + connectorPower + " kW\nPrice: " + price + " " + currency + "\nTime: " + timestamp;

      console.log("Sending to SUPPORT_CHAT_ID:", SUPPORT_CHAT_ID);
      const result = await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);
      console.log("Support message result:", JSON.stringify(result));

      if (userId && userId !== "browser_user") {
        const userMsg = "Your ticket!\nStation: " + stationName + "\nConnector: " + connectorType + " #" + connectorLabel + "\nPrice: " + price + " " + currency;
        await sendMessage(MAIN_BOT_TOKEN, userId, userMsg);
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("ERROR:", err.message);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
  if (req.method === "GET") return res.status(200).json({ ok: true });
  return res.status(405).json({ ok: false });
};