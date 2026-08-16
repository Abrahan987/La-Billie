export default {
  name: 'demote',
  command: ['demote', 'degradar'],
  category: 'group',
  description: 'Degrada a un administrador a usuario común',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, text }) => {
    if (!msg.isGroup) return msg.reply(global.mess?.group || '✦ Este comando solo se puede usar en grupos.');
    let user = msg.quoted ? msg.quoted.sender : msg.mentionedJid?.[0];
    if (!user && text) {
      const cleanText = text.replace(/[^0-9]/g, '');
      if (cleanText) user = `${cleanText}@s.whatsapp.net`;
    }
    if (!user) return msg.reply('✦ Responde a un mensaje o menciona a un usuario para degradar.');

    await sock.groupParticipantsUpdate(msg.chat, [user], 'demote');
    await msg.reply('✦ Usuario degradado a miembro común.');
  }
};
