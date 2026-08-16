import '#config';
import db from '#db';
import chalk from 'chalk';

export async function handler(sock, m) {
  if (!m) return;
  try {
    const isGroup = m.isGroup;
    const sender = m.sender;
    const chatId = m.chat;

    // Database updates/queries
    const chatData = isGroup ? db.getChat(chatId) : null;
    const userData = db.getUser(sender);
    const chatUserData = isGroup ? db.getChatUser(chatId, sender) : null;

    if (chatData?.isBanned) return;

    // Execute 'before' and 'all' hooks from plugins
    for (const exec of global.cmdsExecute) {
      if (typeof exec.fn === 'function') {
        try {
          await exec.fn(sock, m, { db, chatData, userData, chatUserData });
        } catch (e) {
          console.error(chalk.red(`✦ Error en plugin hook ${exec.key}:`), e);
        }
      }
    }

    // Message parsing
    const body = m.body || m.text || '';
    if (!body) return;

    const prefixes = global.prefix || ['/', '!', '.', '#'];
    let usedPrefix = null;

    for (const p of prefixes) {
      if (body.startsWith(p)) {
        usedPrefix = p;
        break;
      }
    }

    if (!usedPrefix) return;

    const args = body.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const cmd = global.comandos.get(commandName);
    if (!cmd) return;

    // Check permissions
    const isOwner = global.owner.includes(sender.replace(/[^0-9]/g, ''));

    if (cmd.isOwner && !isOwner) {
      return m.reply(global.mess.owner);
    }

    if (isGroup) {
      const groupMetadata = await sock.groupMetadata(chatId).catch(() => null);
      const participants = groupMetadata?.participants || [];
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      const senderAdmin = participants.find(p => p.id === sender)?.admin;
      const botAdmin = participants.find(p => p.id === botJid)?.admin;

      if (cmd.isAdmin && !senderAdmin && !isOwner) {
        return m.reply(global.mess.admin);
      }

      if (cmd.botAdmin && !botAdmin) {
        return m.reply(global.mess.botAdmin);
      }
    }

    // Run command
    const text = args.join(' ');
    await cmd.run(sock, m, {
      args,
      text,
      usedPrefix,
      command: commandName,
      isOwner,
      db,
      chatData,
      userData,
      chatUserData
    });

    // Update command count
    db.setUser(sender, 'usedcommands', (userData.usedcommands || 0) + 1);

  } catch (e) {
    console.error(chalk.red('✦ Handler error:'), e);
    m.reply(global.mess.error);
  }
}

export default handler;
