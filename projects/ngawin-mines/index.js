const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN_NGWINMINES, {
  polling: true,
});

function readDb() {
  try {
    const data = fs.readFileSync(__dirname + "/db.json");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o arquivo db.json:", error);
    return null;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(__dirname + "/db.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erro ao escrever no arquivo db.json:", error);
  }
}

function sendGame() {
  const diamond = "💎";
  const empty = "🔵";

  const matriz = [];
  for (let i = 0; i < 5; i++) {
    matriz.push([empty, empty, empty, empty, empty]);
  }

  let totalMines = Math.floor(Math.random() * 3) + 3;

  let count = 0;
  while (count < totalMines) {
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 5);

    if (matriz[row][col] === empty) {
      matriz[row][col] = diamond;
      count++;
    }
  }

  let mensagem = `💎 CONFIRMED ENTRY 💎\n🔺 Select 3 mines 🔺\n👇🏻 Play as in the image below.\n`;

  for (let i = 0; i < 5; i++) {
    mensagem += matriz[i].join(" ") + "\n";
  }

  mensagem += `PLAY RESPONSIBLY‼️\n\n🎯 PLATFORM: ${config.url}`;

  bot.sendMessage(config.channelId, mensagem, {
    disable_web_page_preview: true,
  });

  const db = readDb();
  if (db) {
    db.sendTimestamp = Date.now();
    writeDb(db);
  }
}

function sendWarn() {
  bot.sendMessage(
    config.channelId,
    "⚠️🚨 ATTENTION 🚨⚠️\n\n🚫❌ THERE ARE MANY PEOPLE GETTING 🟥 RED 🟥 BECAUSE THEY ARE PLAYING ON ANOTHER PLATFORM! ❌🚫\n\n‼️📢 !! OUR SIGNAL ONLY WORKS ON THE PLATFORM BELOW !! 📢‼️\n\n💻 Sign up here: <a href='" +
      config.url +
      "'>SIGN UP</a>💻",
    { parse_mode: "HTML", disable_web_page_preview: true }
  );

  const db = readDb();
  if (db) {
    db.warnTimestamp = Date.now();
    writeDb(db);
  }
}

function sendWarnGame() {
  bot.sendMessage(
    config.channelId,
    "💎 Last mines pattern expired\n⏱ Wait for the next pattern"
  );
}

function verifyTime() {
  const db = readDb();
  if (db && db.sendTimestamp) {
    const currentTime = Date.now();
    const timeDiff = currentTime - db.sendTimestamp;

    if (timeDiff >= 2 * 60 * 1000) {
      sendWarnGame();
      setTimeout(() => {
        sendGame();
      }, 1000 * 60);
    }
  }

  if (db && db.warnTimestamp) {
    const currentTime = Date.now();
    const timeDiff = currentTime - db.warnTimestamp;

    if (timeDiff >= 60 * 60 * 1000) {
      sendWarn();
    }
  }
}

verifyTime();
setInterval(verifyTime, 60 * 1000 * 2);
