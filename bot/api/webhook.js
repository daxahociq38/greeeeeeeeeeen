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
        if (message && message.text && message.text.startsWith("/start")) {
          const payload = message.text.replace("/start", "").trim();

          /* ── Deep link: /start ticket_XXXXX ── */
          if (payload.startsWith("ticket_")) {
            const ticketId = payload.replace("ticket_", "");
            const user = message.from || {};
            const userName = [user.first_name, user.last_name].filter(Boolean).join(" ");
            const userHandle = user.username ? " (@" + user.username + ")" : "";
            const userLink = '<a href="tg://user?id=' + user.id + '">' + userName + '</a>';

            // Confirm to the user
            const userMsg =
              "<b>Your ticket has been received!</b>\n\n" +
              "Ticket: <code>" + ticketId + "</code>\n\n" +
              "Our manager will contact you shortly to confirm payment.\n\n" +
              "Need urgent help? Message @greenway_supersupp";
            try { await sendMessage(MAIN_BOT_TOKEN, message.chat.id, userMsg); } catch(e) { console.warn("Could not DM user:", e.message); }

            // Notify support with clickable user link
            if (SUPPORT_CHAT_ID) {
              const supportMsg =
                "<b>Ticket from user</b>\n\n" +
                "User: " + userLink + userHandle + "\n" +
                "User ID: <code>" + user.id + "</code>\n" +
                "Ticket: <code>" + ticketId + "</code>\n\n" +
                "User is waiting for payment confirmation.";
              try { await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMsg); } catch(e) { console.warn("Could not notify support:", e.message); }
            }
            return res.status(200).json({ ok: true });
          }

          /* ── Normal /start — show welcome ── */
          await sendMessage(MAIN_BOT_TOKEN, message.chat.id,
  "⚡ <b>Вітаємо у GreenWay!</b>\n\nМи допоможемо знайти та оплатити зарядку для електромобіля у Польщі 🇵🇱\n\n💰 <b>Тарифи (за сесію):</b>\n• Стандарт (до 22 кВт) — 50 PLN\n• Швидка (22+ кВт) — 80 PLN\n\n✅ Без доплат · Без ліміту часу · До 100%\n\n💬 Підтримка: @greenway_supersupp\n\nНатисніть кнопку нижче 👇",
  { reply_markup: { inline_keyboard: [[{ text: "🔋 Відкрити GreenWay", web_app: { url: MINIAPP_URL } }]] } }
);
        }
        return res.status(200).json({ ok: true });
      }

      const userId = body.user_id || body.userId;
      const userName = body.user_name || body.userName;
      const userHandle = body.user_handle || body.userHandle;
      const ticketId = body.ticket_id || null;
      const stationName = body.station_name || body.stationName || "Unknown";
      const stationId = body.station_id || body.stationId || "";
      const connectorType = body.connector_type || body.connectorType || "";
      const connectorLabel = body.connector_label || body.connectorLabel || "";
      const connectorPower = body.connector_power || body.connectorPower || "";
      const price = body.price || "";
      const currency = body.currency || "PLN";
      const timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Warsaw" });

      // Build clickable user link for support
      const userLink = userId
        ? '<a href="tg://user?id=' + userId + '">' + (userName || "user") + '</a>'
        : (userName || "unknown user");
      const handleText = userHandle ? " (@" + userHandle + ")" : "";

      const supportMessage =
        "<b>New charging ticket!</b>\n\n" +
        "User: " + userLink + handleText + "\n" +
        "User ID: <code>" + (userId || "n/a") + "</code>\n" +
        (ticketId ? "Ticket: <code>" + ticketId + "</code>\n" : "") +
        "\nStation: " + stationName + " (#" + stationId + ")\n" +
        "Connector: " + connectorType + " #" + connectorLabel + ", " + connectorPower + " kW\n" +
        "Price: " + price + " " + currency + "\n" +
        "Time: " + timestamp;

      await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);

      if (userId) {
        const userMsg =
          "<b>Your ticket has been received!</b>\n\n" +
          "Station: " + stationName + "\n" +
          "Connector: " + connectorType + " #" + connectorLabel + "\n" +
          "Price: " + price + " " + currency + "\n" +
          "Time: " + timestamp + "\n" +
          (ticketId ? "Ticket: <code>" + ticketId + "</code>\n" : "") +
          "\nOur manager will contact you shortly.\n" +
          "Need help? Message @Greenway_Supp";
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
