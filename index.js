import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  jidDecode
} from 'baileys';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import chalk from 'chalk';
import readlineSync from 'readline-sync';
import qrcode from 'qrcode-terminal';
import NodeCache from 'node-cache';

import db from '#db';
import { smsg } from '#serialize';
import loadPlugins from '#loader';
import mainHandler from './main.js';
import './config.js';

const logger = pino({ level: 'silent' });
const sessionsDir = path.resolve('./Sessions/Main');

function normalizePhone(number) {
  if (!number) return '';
  let cleaned = number.replace(/[^0-9]/g, '');
  return cleaned;
}

function clearSession() {
  try {
    if (fs.existsSync(sessionsDir)) {
      fs.rmSync(sessionsDir, { recursive: true, force: true });
      console.log(chalk.yellow('✦ Sesión eliminada. Se requiere un nuevo inicio de sesión.'));
    }
  } catch (e) {
    console.error(chalk.red(`✦ Error al limpiar sesión: ${e.message}`));
  }
}

let connectionOption = '1';
let phoneNumber = '';

if (!fs.existsSync(path.join(sessionsDir, 'creds.json'))) {
  console.log(chalk.bold.cyan('\n=== BILLIE EILISH BOT - CONEXIÓN ==='));
  console.log(chalk.white('Selecciona el método de vinculación:'));
  console.log(chalk.green('1. Código QR'));
  console.log(chalk.cyan('2. Código de Vincular (8 dígitos)'));

  connectionOption = readlineSync.question(chalk.yellow('✦ Opción (1 o 2): ')).trim();
  while (!/^[1-2]$/.test(connectionOption)) {
    console.log(chalk.red('✦ Opción inválida. Ingresa 1 o 2.'));
    connectionOption = readlineSync.question(chalk.yellow('✦ Opción (1 o 2): ')).trim();
  }

  if (connectionOption === '2') {
    const phoneInput = readlineSync.question(chalk.yellow('✦ Ingresa tu número de WhatsApp (ej: 573237649689): '));
    phoneNumber = normalizePhone(phoneInput);
    if (!phoneNumber) {
      console.log(chalk.red('✦ Número no válido. Se usará QR por defecto.'));
      connectionOption = '1';
    }
  }
}

let botReady = false;
let reconnectRetries = 0;
const maxRetries = 10;

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionsDir);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  const msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

  const sock = makeWASocket({
    version,
    logger,
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    msgRetryCounterCache
  });

  global.sock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
    }
    return jid;
  };

  if (connectionOption === '2' && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const pairingCode = await sock.requestPairingCode(phoneNumber);
        const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
        console.log(chalk.bold.black.bgGreen(`\n✦ CÓDIGO DE VINCULACIÓN: ${formattedCode} ✦\n`));
      } catch (err) {
        console.error(chalk.red('✦ Error generando código de vinculación:'), err);
      }
    }, 3000);
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && connectionOption === '1') {
      console.log(chalk.cyan('✦ Escanea el siguiente código QR:'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      reconnectRetries = 0;
      botReady = true;
      const userName = sock.user?.name || global.botName;
      console.log(chalk.bold.green(`\n✦ ${userName} CONECTADO CON ÉXITO ✦\n`));
    }

    if (connection === 'close') {
      botReady = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(chalk.yellow(`✦ Conexión cerrada (${statusCode || 'desconocido'}).`));

      if (statusCode === DisconnectReason.loggedOut) {
        clearSession();
        process.exit(1);
      }

      if (shouldReconnect && reconnectRetries < maxRetries) {
        reconnectRetries++;
        const delay = Math.min(3000 * reconnectRetries, 30000);
        console.log(chalk.cyan(`✦ Reconectando en ${delay / 1000}s (Intento ${reconnectRetries}/${maxRetries})...`));
        setTimeout(startBot, delay);
      } else {
        console.log(chalk.red('✦ Límite de reconexiones alcanzado. Limpiando y saliendo...'));
        clearSession();
        process.exit(1);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;
        const serializedMsg = await smsg(sock, msg);
        await mainHandler(sock, serializedMsg);
      } catch (err) {
        console.error(chalk.red('✦ Error procesando mensaje:'), err);
      }
    }
  });
}

(async () => {
  console.log(chalk.bold.magenta(`\n✦ Iniciando ${global.botName} por ${global.ownerName}...`));
  db.initDB();
  await loadPlugins();
  await startBot();
})();
