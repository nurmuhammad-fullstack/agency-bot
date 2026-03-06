# Xroot IT Company - Telegram Bot

## Тавсиф

Bu Telegram bot **Xroot IT Company** учун яратилган. Бот мижозларга қуйидаги имкониятларни тақдим этади:

- 💻 Хизматлар билан танишиш
- ✍️ Савол юбориш  
- 🚀 Лойиха буюртма қилиш
- 📞 Богланиш (контакт)

## Тезкор бошланг

### 1. Олдинги шартлар
```bash
# Node.js ва MongoDB ўрнатилган бўлиши керак
node --version    # >= 14
mongod --version # Local MongoDB
```

### 2. Ўрнатиш
```bash
cd agency-bot
npm install
cp .env.example .env
```

### 3. .env созлаш
```env
# Telegram Bot Token (BotFather дан олинг)
BOT_TOKEN=your_bot_token_here

# Admin Telegram ID
ADMIN_ID=your_telegram_id_here

# Port (ихтиёрий)
PORT=8080
```

**BotToken олиш:** 
1. @BotFather га боринг
2. /newbot деп ёзинг
3. Бот номи ва username беринг
4. Token олинг

**Admin ID олиш:**
1. @userinfobot га боринг
2. ID олинг

### 4. Ишга тушириш
```bash
npm start
```

Бот ишга тушганда **"Bot ishga tushdi 🚀"** деб ёзилади.

---

## CRM билан интеграция

Бот CRM сервери билан ишлайди (agency-crm).

```javascript
const CRM_API = 'http://localhost:3001'; // CRM адрес
```

CRM серверни алохида терминалда ишга туширинг:
```bash
cd ../agency-crm
npm start
```

---

## Бот функциялари

### Асосий меню
- 💻 **Хизматлар** - Барча хизматлар рўйхати
- ✍️ **Савол юбориш** - Савол ёзиш
- 🚀 **Лойихам бор** - Лойиха тавсифи
- 📞 **Богланиш** - Контакт юбориш

### Admin функциялар
Админ хар қандай хабарга reply ёзиш орқали фойдаланувчига жавоб юборади.

---

## API Эндпоинтлар

| Метод | URL | Описание |
|-------|-----|----------|
| GET | / | Health check |

---

## Deploy

### PM2 билан
```bash
npm install -g pm2
pm2 start index.js --name xroot-bot
pm2 save
```

### Docker (ихтиёрий)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

---

## Муаммолар

**"MongoNetworkError"** - MongoDB ишламаяпти. MongoDBни ишга туширинг.

**"Polling error"** - Bot token нотугри. .env даги TOKENни текширинг.

**"ECONNREFUSED"** - CRM сервер ишламаяпти. agency-crm папкасида `npm start` ишга туширинг.

