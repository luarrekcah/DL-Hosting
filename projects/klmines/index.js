const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN_KLMINES, {
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

async function sendGame() {
  const diamond = "💎";
  const empty = "⬛️";

  const matriz = [];
  for (let i = 0; i < 5; i++) {
    matriz.push([empty, empty, empty, empty, empty]);
  }

  let count = 0;

  let totalMines = Math.floor(Math.random() * 4) + 2;
  let totalDiamonds = Math.floor(Math.random() * 3) + 4;

  while (count < totalDiamonds) {
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 5);

    if (matriz[row][col] === empty) {
      matriz[row][col] = diamond;
      count++;
    }
  }

  const brasiliaTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const currentTime = new Date(brasiliaTime);
  currentTime.setMinutes(currentTime.getMinutes() + 3);

  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");

  const time = `${hours}:${minutes}`;

  let mensagem = `🟢🟢 Entrada Confirmada 🟢🟢\n\n💣 Selecione com ${totalMines} minas\n\n⏱ Valido até as ${time}\n🎲 Tentativas: 3\n\n🎯Entrada:\n\n`;

  let msgEditada = `🔵🔵 Entrada Finalizada 🔵🔵\n\n💣 Selecione com ${totalMines} minas\n\n⏱ Valido até as ${time}\n🎲 Tentativas: 3\n\n🎯Entrada:\n\n`;


  for (let i = 0; i < 5; i++) {
    mensagem += matriz[i].join(" ") + "\n";
    msgEditada += matriz[i].join(" ") + "\n";
  }

  mensagem += `\n📲 OS SINAIS SÓ FUCIONA NA PLATAFORMA ABAIXO👇🏻\n\n⚠️PLATAFORMA: ${config.url}`;
  msgEditada += `\n📲 OS SINAIS SÓ FUCIONA NA PLATAFORMA ABAIXO👇🏻\n\n⚠️PLATAFORMA: ${config.url}`;

  const sentMessage = await bot.sendMessage(config.channelId, mensagem, {
    disable_web_page_preview: true,
  });

  setTimeout(() => {
    try {
      bot.editMessageText(msgEditada, {
        chat_id: config.channelId,
        message_id: sentMessage.message_id,
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.log(error);
    }
  }, 3 * 60 * 1000)

  const db = readDb();
  if (db) {
    db.sendTimestamp = Date.now();
    writeDb(db);
  }
}

function sendWarn() {
  bot.sendMessage(
    config.channelId,
    "⚠️🚨 ATENÇÃO 🚨⚠️\n\n🚫❌ TEM MUITAS PESSOAS QUE ESTÃO TOMANDO 🟥 RED 🟥 PORQUE ESTÃO JOGANDO EM OUTRA PLATAFORMA! ❌🚫\n\n‼️📢 !! NOSSO SINAL SÓ FUNCIONA NA PLATAFORMA ABAIXO !! 📢‼️\n\n💻 Cadastre-se aqui: <a href='" +
      config.url +
      "'>CADASTRAR</a>💻",
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
    `⚠️ ATENÇÃO, possível entrada\n⌚️ Aguarde a confirmação\n🎰 CADASTRE-SE 👉🏻 ${config.url}`,
    { disable_web_page_preview: true }
  );
}

function verifyTime() {
  const db = readDb();
  if (db && db.sendTimestamp) {
    const currentTime = Date.now();
    const timeDiff = currentTime - db.sendTimestamp;

    if (timeDiff >= 3 * 60 * 1000) {
      setTimeout(() => {
        sendWarnGame();
      }, 1000 * 10);
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
