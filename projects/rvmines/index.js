const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN_RV, { polling: true });

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
  const empty = "⚫";

  const matriz = [];
  for (let i = 0; i < 5; i++) {
    matriz.push([empty, empty, empty, empty, empty]);
  }

  let count = 0;
  while (count < 4) {
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 5);

    if (matriz[row][col] === empty) {
      matriz[row][col] = diamond;
      count++;
    }
  }

  let mensagem = "O sistema gerou os seguintes sinais:\nAposte com 4 💣.\n\n";

  for (let i = 0; i < 5; i++) {
    mensagem += matriz[i].join(" ") + "\n";
  }

  mensagem += `\n🎰 MÁXIMO 2 TENTATIVAS\n⏰ VALIDADE: 2 MINUTOS\n🎯 PLATAFORMA: ${config.url}`;

  bot.sendMessage(config.channelId, mensagem);

  const db = readDb();
  if (db) {
    db.sendTimestamp = Date.now();
    writeDb(db);
  }
}

function sendWarn() {
  bot.sendMessage(
    config.channelId,
    "⚠️🚨 ATENÇÃO 🚨⚠️\n\n🚫❌ TEM MUITAS PESSOAS QUE ESTÃO TOMANDO 🟥 RED 🟥 PORQUE ESTÃO JOGANDO EM OUTRA PLATAFORMA! ❌🚫\n\n‼️📢 !! NOSSO SINAL SÓ FUNCIONA NA PLATAFORMA ABAIXO !! 📢‼️\n\n💻 Cadastre-se aqui: " +
      config.url +
      "💻"
  );

  const db = readDb();
  if (db) {
    db.warnTimestamp = Date.now();
    writeDb(db);
  }
}

function verifyTime() {
  const db = readDb();
  if (db && db.sendTimestamp) {
    const currentTime = Date.now();
    const timeDiff = currentTime - db.sendTimestamp;

    if (timeDiff >= 2 * 60 * 1000) {
      sendGame();
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


verifyTime()
setInterval(verifyTime, 60 * 1000);
