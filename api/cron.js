const MAIN_BOT_TOKEN = process.env.MAIN_BOT_TOKEN;
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL;

const reminderText =
  "☀️ <b>Доброго ранку!</b>\n\n" +
  "Нагадуємо — з GreenWay ви заряджаєте електромобіль зі знижкою 50% 🔋\n\n" +
  "💰 <b>Фіксовані тарифи за сеанс:</b>\n" +
  "• Стандарт (до 22 кВт) — <b>50 PLN</b>\n" +
  "• Швидка (22+ кВт) — <b>80 PLN</b>\n\n" +
  "✅ Без доплат · Без ліміту часу · До 100%\n\n" +
  "❓ Питання або потрібна допомога? Напишіть нам → @greenway_supersupp\n\n" +
  "👇 Відкрийте додаток, щоб обрати станцію";

async function sendMessage(chatId, text) {
  const res = await fetch("https://api.telegram.org/bot" + MAIN_BOT_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🔋 Відкрити GreenWay", web_app: { url: MINIAPP_URL } }]] },
    }),
  });
  return res.json();
}

export default async function handler(req, res) {
  // Vercel Cron sends GET with a special header
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  try {
    // Fetch all user IDs from Redis
    const r = await fetch(REDIS_URL + "/smembers/gw_users", {
      headers: { Authorization: "Bearer " + REDIS_TOKEN },
    });
    const data = await r.json();
    const users = data.result || [];

    let sent = 0, failed = 0;
    for (const userId of users) {
      try {
        const result = await sendMessage(userId, reminderText);
        if (result.ok) sent++;
        else {
          failed++;
          // Remove blocked users (403) from the set
          if (result.error_code === 403) {
            await fetch(REDIS_URL + "/srem/gw_users/" + userId, {
              headers: { Authorization: "Bearer " + REDIS_TOKEN },
            });
          }
        }
      } catch (e) {
        failed++;
      }
      // Telegram rate limit: max ~30 msg/sec
      await new Promise(r => setTimeout(r, 40));
    }

    return res.status(200).json({ ok: true, total: users.length, sent, failed });
  } catch (err) {
    console.error("Cron error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
