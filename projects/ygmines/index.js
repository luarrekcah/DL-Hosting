const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN, {
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
  const diamond = "⭐";
  const empty = "🔵";

  const matriz = [];
  for (let i = 0; i < 5; i++) {
    matriz.push([empty, empty, empty, empty, empty]);
  }

  let totalMines = 3;

  if (Math.random() <= 0.25) {
    totalMines = 4;
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

  let mensagem = "SINAL GERADO‼️\n🔁tentativas: 2\n\n";

  for (let i = 0; i < 5; i++) {
    mensagem += matriz[i].join(" ") + "\n";
  }

  const agora = new Date();

  // Adiciona dois minutos
  agora.setMinutes(agora.getMinutes() + 2);

  // Obtém a nova hora após adicionar dois minutos
  const novaHora = agora.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });

  // Formata a hora para o formato "HH:MM"
  const formatarHora = (hora) => hora.split(":").slice(0, 2).join(":");

  mensagem += `\n\naposte com ${totalMines} 💣\nVálido até ${formatarHora(
    novaHora
  )} ⏰\n<a href="${
    config.url
  }">➡️CADASTRE-SE </a>\n\n⚠️ROBÔ UNICAMENTE\nPROJETADO PARA FALHAS\nDA PLATAFORMA ACIMA⚠️`;

  bot.sendMessage(config.channelId, mensagem, {
    parse_mode: "HTML",
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
    "✅SINAL FINALIZADO\nAGUARDE O PRÓXIMO SINAL"
  );
}

function verifyTime() {
  const db = readDb();
  if (db && db.sendTimestamp) {
    const currentTime = Date.now();
    const timeDiff = currentTime - db.sendTimestamp;

    if (timeDiff >= (2 * 60 * 1000)+30000) {
      //sendWarnGame();
      //  setTimeout(() => {
      sendGame();
      //}, 1000 * 60);
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
