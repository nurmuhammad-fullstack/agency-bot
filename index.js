const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

const userState = new Map();

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "Assalomu alaykum 👋\nSavolingizni yuborishingiz mumkin:",
        {
            reply_markup: {
                keyboard: [
                    ["🕵️ Anonim savol"],
                    ["📞 Kontakt orqali"]
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === "🕵️ Anonim savol") {
        userState.set(chatId, "waiting_anonymous");
        return bot.sendMessage(chatId, "Savolingizni yozing ✍️");
    }

    if (msg.text === "📞 Kontakt orqali") {
        userState.set(chatId, "waiting_contact");
        return bot.sendMessage(chatId,
            "Kontaktni yuboring 👇",
            {
                reply_markup: {
                    keyboard: [[{
                        text: "Kontakt yuborish",
                        request_contact: true
                    }]],
                    resize_keyboard: true
                }
            }
        );
    }

    if (userState.get(chatId) === "waiting_anonymous" && msg.text) {

        await bot.sendMessage(
            ADMIN_ID,
            `📩 Yangi anonim savol:\n\n${msg.text}\n\nUserID: ${chatId}`
        );

        userState.delete(chatId);
        return bot.sendMessage(chatId, "Savolingiz yuborildi ✅");
    }

    if (msg.contact && userState.get(chatId) === "waiting_contact") {

        await bot.sendMessage(
            ADMIN_ID,
            `📞 Yangi kontakt:\nIsm: ${msg.contact.first_name}\nTelefon: ${msg.contact.phone_number}\nUserID: ${chatId}`
        );

        userState.delete(chatId);
        return bot.sendMessage(chatId, "Kontakt yuborildi ✅");
    }

    if (msg.reply_to_message && msg.from.id === ADMIN_ID) {

        const originalText = msg.reply_to_message.text;
        const match = originalText.match(/UserID: (\d+)/);

        if (!match) return;

        const userId = match[1];

        await bot.sendMessage(
            userId,
            `📩 Javob:\n${msg.text}`
        );
    }
});

console.log("Bot ishga tushdi 🚀");


