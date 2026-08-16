import chalk from 'chalk';
import moment from 'moment-timezone';
import db from '#db';
import './config.js';

export default async (sock, msg) => {
  if (!msg || !msg.chat) return;

  const sender = msg.sender;
  const from = msg.chat;
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const user = db.getUser(sender);
  const chat = db.getChat(from);
  const settings = db.getSettings(botJid);
  const chatUser = db.getChatUser(from, sender);

  const pushName = msg.pushName || 'Usuario';
  const senderNumber = sender.split('@')[0];

  const ownerList = [
    global.ownerNumber,
    ...(Array.isArray(global.owner) ? global.owner : [])
  ].map(num => num.replace(/[^0-9]/g, ''));

  const isOwner = ownerList.includes(senderNumber);

  let groupMetadata = null;
  let groupName = '';
  let isAdmin = false;
  let isBotAdmin = false;

  if (msg.isGroup) {
    try {
      groupMetadata = await sock.groupMetadata(from).catch(() => null);
      if (groupMetadata) {
        groupName = groupMetadata.subject || '';
        const participants = groupMetadata.participants || [];
        const admins = participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id.split('@')[0]);

        isAdmin = admins.includes(senderNumber);
        isBotAdmin = admins.includes(botJid.split('@')[0]);
      }
    } catch {}
  }

  // Execute global middlewares (before / all)
  if (Array.isArray(global.middlewares)) {
    for (const mw of global.middlewares) {
      if (typeof mw.fn === 'function') {
        try {
          await mw.fn({ sock, msg, isOwner, isAdmin, isBotAdmin, groupMetadata });
        } catch (e) {
          console.error(chalk.red(`✦ Error en middleware [${mw.key}]: ${e.message}`));
        }
      }
    }
  }

  // Determine prefix
  const prefixes = Array.isArray(global.prefix) ? global.prefix : ['.', '/', '#', '!'];
  let usedPrefix = '';
  for (const p of prefixes) {
    if (msg.text && msg.text.startsWith(p)) {
      usedPrefix = p;
      break;
    }
  }

  if (!usedPrefix) return;

  const rawArgs = msg.text.slice(usedPrefix.length).trim().split(/ +/);
  const command = (rawArgs.shift() || '').toLowerCase();
  const text = rawArgs.join(' ');

  if (!command) return;

  const cmdData = global.commands ? global.commands.get(command) : null;
  if (!cmdData) return;

  // Log command execution
  console.log(chalk.bold.cyan(`╭────────────────────────────✦`));
  console.log(chalk.bold.white(`│ Bot: ${global.botName}`));
  console.log(chalk.bold.yellow(`│ Comando: ${usedPrefix}${command}`));
  console.log(chalk.bold.green(`│ Usuario: ${pushName} (${senderNumber})`));
  console.log(chalk.bold.magenta(`│ Chat: ${msg.isGroup ? groupName : 'Privado'}`));
  console.log(chalk.bold.cyan(`╰────────────────────────────✦`));

  // Check conditions
  if (cmdData.isOwner && !isOwner) {
    return msg.reply(global.mess?.owner || '✦ Este comando solo es para mi creador.');
  }
  if (msg.isGroup && cmdData.isAdmin && !isAdmin) {
    return msg.reply(global.mess?.admin || '✦ Este comando solo es para administradores.');
  }
  if (msg.isGroup && cmdData.botAdmin && !isBotAdmin) {
    return msg.reply(global.mess?.botAdmin || '✦ Necesito ser administrador para ejecutar este comando.');
  }

  try {
    // Update user and settings stats
    user.usedcommands = (user.usedcommands || 0) + 1;
    db.setUser(sender, 'usedcommands', user.usedcommands);
    db.setUser(sender, 'name', pushName);

    settings.commandsejecut = (settings.commandsejecut || 0) + 1;
    db.setSettings(botJid, 'commandsejecut', settings.commandsejecut);

    // Run plugin command
    await cmdData.run({
      sock,
      msg,
      args: rawArgs,
      text,
      usedPrefix,
      command,
      isOwner,
      isAdmin,
      isBotAdmin,
      groupMetadata
    });
  } catch (error) {
    console.error(chalk.red(`✦ Error al ejecutar comando ${command}:`), error);
    await msg.reply(`✦ Ocurrió un error al ejecutar el comando: ${error?.message || error}`);
  }
};
