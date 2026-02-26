require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 8080;

const app = express();
app.get("/", (req, res) => res.send("Bot ishlayapti 🚀"));
app.listen(PORT, () => console.log("Server running 🚀"));

const bot = new TelegramBot(TOKEN, { polling: true });

const userState = new Map();
const botMessages = new Map(); // chatId -> messageIds


// ================= CLEAN FUNCTIONS =================

// Bot message saqlash
async function sendAndStore(chatId, text, options = {}) {
  const sent = await bot.sendMessage(chatId, text, options);

  if (!botMessages.has(chatId)) {
    botMessages.set(chatId, []);
  }

  botMessages.get(chatId).push(sent.message_id);
}

// Eski bot xabarlarini o‘chirish
async function clearBotMessages(chatId) {
  if (!botMessages.has(chatId)) return;

  for (const id of botMessages.get(chatId)) {
    try {
      await bot.deleteMessage(chatId, id);
    } catch (err) {}
  }

  botMessages.set(chatId, []);
}

// Faqat menyu (intro yo‘q)
async function sendMainMenu(chatId) {
  await sendAndStore(
    chatId,
    "Quyidagilardan birini tanlang 👇",
    {
      reply_markup: {
        keyboard: [
          ["✍️ Savol yuborish"],
          ["🚀 Loyiham bor"],
          ["📞 Bog‘lanish"]
        ],
        resize_keyboard: true
      }
    }
  );
}

// ================= START =================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  userState.delete(chatId);
  await clearBotMessages(chatId);

  await sendAndStore(
    chatId,
    `<b>Assalomu alaykum 👋</b>

<b>Xroot IT Company</b> — biznesingizni raqamlashtiramiz.

💻 Web saytlar  
🤖 Telegram botlar  
📊 CRM va avtomatlashtirish  
📈 Onlayn savdoni oshirish  

<i>Loyihangiz yoki savolingizni yuboring.
Bepul konsultatsiya beramiz.</i>`,
    { parse_mode: "HTML" }
  );

  await sendMainMenu(chatId);
});


// ================= MESSAGE HANDLER =================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text && !msg.contact) return;

  // 🔙 Orqaga
  if (msg.text === "🔙 Orqaga") {
    userState.delete(chatId);
    await clearBotMessages(chatId);
    return sendMainMenu(chatId);
  }

  // ✍️ Savol
  if (msg.text === "✍️ Savol yuborish") {
    await clearBotMessages(chatId);
    userState.set(chatId, "question");

    return sendAndStore(
      chatId,
      "Savolingizni yozing ✍️",
      {
        reply_markup: {
          keyboard: [["🔙 Orqaga"]],
          resize_keyboard: true
        }
      }
    );
  }

  // 🚀 Loyiha
  if (msg.text === "🚀 Loyiham bor") {
    await clearBotMessages(chatId);
    userState.set(chatId, "project");

    return sendAndStore(
      chatId,
      "Loyihangiz haqida yozing 📄",
      {
        reply_markup: {
          keyboard: [["🔙 Orqaga"]],
          resize_keyboard: true
        }
      }
    );
  }

  // 📞 Bog‘lanish
  if (msg.text === "📞 Bog‘lanish") {
    await clearBotMessages(chatId);
    userState.set(chatId, "contact");

    return sendAndStore(
      chatId,
      "Kontaktni yuboring 👇",
      {
        reply_markup: {
          keyboard: [
            [{ text: "Kontakt yuborish", request_contact: true }],
            ["🔙 Orqaga"]
          ],
          resize_keyboard: true
        }
      }
    );
  }

  // ================= SAVOL / LOYIHA YUBORISH =================

  if (
    (userState.get(chatId) === "question" ||
      userState.get(chatId) === "project") &&
    msg.text
  ) {
    const fullName =
      `${msg.from.first_name || ""} ${msg.from.last_name || ""}`.trim();

    const username = msg.from.username
      ? `@${msg.from.username}`
      : "Username yo‘q";

    const type =
      userState.get(chatId) === "question"
        ? "📩 Yangi savol"
        : "🚀 Yangi loyiha";

    await bot.sendMessage(
      ADMIN_ID,
      `${type}

👤 Ism: ${fullName}
🔗 Username: ${username}
🆔 UserID: ${chatId}

💬 Matn:
${msg.text}`
    );

    userState.delete(chatId);
    await clearBotMessages(chatId);

    await sendAndStore(
      chatId,
      "✅ Yuborildi. Tez orada javob beramiz."
    );

    return sendMainMenu(chatId);
  }

  // ================= KONTAKT =================

  if (msg.contact && userState.get(chatId) === "contact") {
    const fullName =
      `${msg.from.first_name || ""} ${msg.from.last_name || ""}`.trim();

    const username = msg.from.username
      ? `@${msg.from.username}`
      : "Username yo‘q";

    await bot.sendMessage(
      ADMIN_ID,
      `📞 Yangi kontakt

👤 Ism: ${fullName}
📱 Telefon: ${msg.contact.phone_number}
🔗 Username: ${username}
🆔 UserID: ${chatId}`
    );

    userState.delete(chatId);
    await clearBotMessages(chatId);

    await sendAndStore(
      chatId,
      "✅ Yuborildi. Tez orada javob beramiz."
    );

    return sendMainMenu(chatId);
  }

  // ================= ADMIN REPLY =================

  if (msg.reply_to_message && msg.from.id === ADMIN_ID) {
    const match = msg.reply_to_message.text?.match(/UserID: (\d+)/);
    if (!match) return;

    await bot.sendMessage(match[1], `📩 Javob:\n${msg.text}`);
  }
});

console.log("Bot ishga tushdi 🚀");