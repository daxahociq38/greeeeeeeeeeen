const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPPORT_CHAT_ID = process.env.SUPPORT_CHAT_ID;
const MINIAPP_URL = process.env.MINIAPP_URL;
const MAIN_BOT_TOKEN = process.env.MAIN_BOT_TOKEN;
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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

async function saveUser(userId) {
  if (!REDIS_URL || !userId) return;
  try {
    await fetch(REDIS_URL + "/sadd/gw_users/" + userId, {
      headers: { Authorization: "Bearer " + REDIS_TOKEN },
    });
  } catch (e) { console.warn("saveUser failed:", e.message); }
}

/* ── Message templates ── */
const welcomeText =
  "⚡ <b>Заряджайте на GreenWay зі знижкою 50%!</b>\n\n" +
  "Втомились платити 200+ злотих за зарядку? З нами — від 50 PLN за повну сесію.\n\n" +
  "🔋 <b>Як це працює — 3 кроки:</b>\n" +
  "1️⃣ Відкрийте додаток → оберіть станцію\n" +
  "2️⃣ Виберіть конектор → натисніть «Оплатити»\n" +
  "3️⃣ Ми надішлемо деталі оплати — і ви заряджаєте!\n\n" +
  "💰 <b>Фіксовані тарифи:</b>\n" +
  "• Стандарт (до 22 кВт) — 50 PLN\n" +
  "• Швидка (22+ кВт) — 80 PLN\n\n" +
  "✅ Без доплат · Без ліміту часу · До 100%\n" +
  "✅ Працює з будь-якою карткою 🇺🇦\n\n" +
  "👇 Натисніть кнопку нижче, щоб почати\n\n" +
  "❓ Питання? → @greenway_supersupp";

const helpText =
  "❓ <b>Часті питання:</b>\n\n" +
  "🔹 <b>Як замовити зарядку?</b>\n" +
  "Відкрийте додаток → оберіть станцію → виберіть конектор → натисніть «Оплатити». Ми надішлемо реквізити.\n\n" +
  "🔹 <b>Чому так дешево?</b>\n" +
  "Фіксована ціна за сеанс замість оплати за кВт. Економія до 50%.\n\n" +
  "🔹 <b>Які конектори?</b>\n" +
  "CCS, Type 2, CHAdeMO — усі типи на станціях GreenWay.\n\n" +
  "🔹 <b>Як довго можна заряджати?</b>\n" +
  "Без обмежень — до 100%. Ніяких штрафів за час.\n\n" +
  "🔹 <b>Яка зона покриття?</b>\n" +
  "Усі станції GreenWay по всій Польщі — понад 800 точок.\n\n" +
  "🔹 <b>Як оплатити?</b>\n" +
  "Переказ на картку після вибору конектора. Ми активуємо зарядку.\n\n" +
  "📩 Ще питання? → @greenway_supersupp";

const priceText =
  "💰 <b>Тарифи GreenWay зі знижкою 50%:</b>\n\n" +
  "⚡ Стандартна зарядка (до 22 кВт):\n" +
  "• GreenWay додаток: ~100 PLN\n" +
  "• Через нас: <b>50 PLN</b> ✅\n\n" +
  "⚡ Швидка зарядка (22+ кВт):\n" +
  "• GreenWay додаток: ~160 PLN\n" +
  "• Через нас: <b>80 PLN</b> ✅\n\n" +
  "✅ Фіксована ціна за сеанс\n" +
  "✅ Без доплат і прихованих комісій\n" +
  "✅ Без ліміту часу — до 100%\n" +
  "✅ Працює з будь-якою карткою\n\n" +
  "👇 Натисніть кнопку нижче, щоб обрати станцію";

const fallbackText =
  "👋 Привіт! Я бот GreenWay — допомагаю заряджати електромобіль зі знижкою 50%.\n\n" +
  "Ось що я вмію:\n" +
  "🔋 /start — відкрити додаток\n" +
  "💰 /price — переглянути тарифи\n" +
  "❓ /help — часті питання\n\n" +
  "Або натисніть кнопку нижче 👇";

function appButton(label) {
  return { reply_markup: { inline_keyboard: [[{ text: label, web_app: { url: MINIAPP_URL } }]] } };
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

      /* ═══ Telegram webhook update ═══ */
      if (body.update_id !== undefined) {
        const message = body.message;
        if (!message || !message.text) return res.status(200).json({ ok: true });

        const text = message.text.trim();
        const chatId = message.chat.id;

        /* ── /start ── */
        if (text.startsWith("/start")) {
          await saveUser(chatId);
          const payload = text.replace("/start", "").trim();

          /* Deep link: /start ticket_XXXXX */
          if (payload.startsWith("ticket_")) {
            const ticketId = payload.replace("ticket_", "");
            const user = message.from || {};
            const userName = [user.first_name, user.last_name].filter(Boolean).join(" ");
            const userHandle = user.username ? " (@" + user.username + ")" : "";
            const userLink = '<a href="tg://user?id=' + user.id + '">' + userName + '</a>';

            const userMsg =
              "✅ <b>Заявку прийнято!</b>\n\n" +
              "🎫 <code>" + ticketId + "</code>\n\n" +
              "📋 <b>Що далі:</b>\n" +
              "1️⃣ Менеджер надішле реквізити оплати\n" +
              "2️⃣ Переказуєте суму\n" +
              "3️⃣ Ми активуємо зарядку ⚡\n\n" +
              "⏱ Відповідаємо протягом 5 хвилин\n\n" +
              "❓ Питання → @greenway_supersupp";
            try { await sendMessage(MAIN_BOT_TOKEN, chatId, userMsg); } catch(e) { console.warn("Could not DM user:", e.message); }

            if (SUPPORT_CHAT_ID) {
              const supportMsg =
                "🔔 <b>НОВА ЗАЯВКА</b>\n" +
                "━━━━━━━━━━━━━━━━━━\n" +
                "👤 " + userLink + userHandle + "\n" +
                "🆔 <code>" + user.id + "</code>\n" +
                "🎫 <code>" + ticketId + "</code>\n" +
                "━━━━━━━━━━━━━━━━━━\n" +
                "⚡ Надішліть реквізити → натисніть на ім'я вище";
              try { await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMsg); } catch(e) { console.warn("Could not notify support:", e.message); }
            }
            return res.status(200).json({ ok: true });
          }

          /* Normal /start — welcome */
          await sendMessage(MAIN_BOT_TOKEN, chatId, welcomeText, appButton("🔋 Відкрити GreenWay"));
          return res.status(200).json({ ok: true });
        }

        /* ── /help ── */
        if (text.startsWith("/help")) {
          await saveUser(chatId);
          await sendMessage(MAIN_BOT_TOKEN, chatId, helpText, appButton("🔋 Відкрити додаток"));
          return res.status(200).json({ ok: true });
        }

        /* ── /price ── */
        if (text.startsWith("/price")) {
          await saveUser(chatId);
          await sendMessage(MAIN_BOT_TOKEN, chatId, priceText, appButton("🔋 Обрати станцію"));
          return res.status(200).json({ ok: true });
        }

        /* ── Smart replies for any other text ── */
        await saveUser(chatId);
        const lower = text.toLowerCase();
        if (lower.includes("ціна") || lower.includes("тариф") || lower.includes("скільки") || lower.includes("price") || lower.includes("cost")) {
          await sendMessage(MAIN_BOT_TOKEN, chatId, priceText, appButton("🔋 Обрати станцію"));
        } else if (lower.includes("допомог") || lower.includes("help") || lower.includes("як") || lower.includes("how")) {
          await sendMessage(MAIN_BOT_TOKEN, chatId, helpText, appButton("🔋 Відкрити додаток"));
        } else {
          await sendMessage(MAIN_BOT_TOKEN, chatId, fallbackText, appButton("🔋 Відкрити GreenWay"));
        }
        return res.status(200).json({ ok: true });
      }

      /* ═══ Notification from mini-app frontend ═══ */
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

      const userLink = userId
        ? '<a href="tg://user?id=' + userId + '">' + (userName || "користувач") + '</a>'
        : (userName || "невідомий");
      const handleText = userHandle ? " @" + userHandle : "";

      const supportMessage =
        "🔔 <b>НОВА ЗАЯВКА НА ЗАРЯДКУ</b>\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "👤 " + userLink + handleText + "\n" +
        "🆔 <code>" + (userId || "н/д") + "</code>\n" +
        (ticketId ? "🎫 <code>" + ticketId + "</code>\n" : "") +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🏢 " + stationName + " (#" + stationId + ")\n" +
        "🔌 " + connectorType + " #" + connectorLabel + " · " + connectorPower + " кВт\n" +
        "💰 <b>" + price + " " + currency + "</b>\n" +
        "🕐 " + timestamp + "\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "⚡ Надішліть реквізити → натисніть на ім'я вище";

      await sendMessage(BOT_TOKEN, SUPPORT_CHAT_ID, supportMessage);

      if (userId) {
        await saveUser(userId);
        const userMsg =
          "✅ <b>Заявку прийнято!</b>\n\n" +
          "🏢 " + stationName + "\n" +
          "🔌 " + connectorType + " #" + connectorLabel + " · " + connectorPower + " кВт\n" +
          "💰 До оплати: <b>" + price + " " + currency + "</b>\n" +
          "🕐 " + timestamp + "\n" +
          (ticketId ? "🎫 <code>" + ticketId + "</code>\n" : "") +
          "\n📋 <b>Що далі:</b>\n" +
          "1️⃣ Менеджер надішле реквізити оплати\n" +
          "2️⃣ Переказуєте " + price + " " + currency + "\n" +
          "3️⃣ Ми активуємо зарядку ⚡\n\n" +
          "⏱ Відповідаємо протягом 5 хвилин\n" +
          "❓ Питання → @greenway_supersupp";
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
