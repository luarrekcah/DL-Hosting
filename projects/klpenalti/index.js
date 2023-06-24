const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN_KLPENALTI, {
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

function getRandomFlag() {
  const flags = [
    "🇦🇹", // Áustria
    "🇦🇿", // Azerbaijão
    "🇧🇪", // Bélgica
    "🇭🇷", // Croácia
    "🇨🇿", // República Tcheca
    "🇩🇰", // Dinamarca
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", // Inglaterra
    "🇫🇮", // Finlândia
    "🇫🇷", // França
    "🇩🇪", // Alemanha
    "🇮🇹", // Itália
    "🇮🇪", // Irlanda
    "🇳🇱", // Países Baixos
    "🇵🇱", // Polônia
    "🇵🇹", // Portugal
    "🇲🇪", // Montenegro
    "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia", // Escócia
    "🇷🇸", // Sérvia
    "🇪🇸", // Espanha
    "🇸🇪", // Suécia
    "🇨🇭", // Suíça
    "🇹🇷", // Turquia
    "🇺🇦", // Ucrânia
    "🇺🇿", // Uzbequistão
  ];
  const randomIndex = Math.floor(Math.random() * flags.length);
  return flags[randomIndex];
}

function sendGame() {
  const goleiroEmoji = "     "; // Espaço do goleiro ou substituir por um emoji simbôlico
  const bolaEmoji = "⚽️";
  const bloqueadoEmoji = "🚫";
  const qntEntradas = 3;

  let mensagem = "🔵🔵 Entrada Confirmada 🔵🔵\n\n";
  mensagem += `🎯Entrada: ${getRandomFlag()}\n`;
  mensagem += `🔥Buscando: x${Math.pow(2, qntEntradas - 1) * 1.92}\n`;

  for (let entrada = 1; entrada <= qntEntradas; entrada++) {
    mensagem += `\n🔥 ${entrada}º Entrada: x${
      Math.pow(2, entrada - 1) * 1.92
    }\n\n`;

    let matriz = [
      [bloqueadoEmoji, bloqueadoEmoji, bloqueadoEmoji],
      [bloqueadoEmoji, goleiroEmoji, bloqueadoEmoji],
    ];

    let bolaPosicionada = false;
    while (!bolaPosicionada) {
      const row = Math.floor(Math.random() * 2);
      const col = Math.floor(Math.random() * 3);

      if (matriz[row][col] !== goleiroEmoji) {
        matriz[row][col] = bolaEmoji;
        bolaPosicionada = true;
      }
    }

    for (let i = 0; i < matriz.length; i++) {
      for (let j = 0; j < matriz[i].length; j++) {
        mensagem += matriz[i][j];
        mensagem += "";
      }
      mensagem += "\n";
    }
  }

  mensagem += `\n🎰 PLATAFORMA: ${config.url}\n\n`;
  mensagem += `ENTRE AQUI 👉🏻 ${config.url}`;

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
