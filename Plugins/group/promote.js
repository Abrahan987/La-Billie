export default {
  name: 'promote',
  command: ['promote', 'promover'],
  category: 'group',
  description: 'Promueve a un miembro a administrador',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, text }) => {
    if (!msg.isGroup) return msg.reply(global.mess?.group || '✦ Este comando solo se puede usar en grupos.');
    let user = msg.quoted ? msg.quoted.sender : msg.mentionedJid?.[0];
    if (!user && text) {
      const cleanText = text.replace(/[^0-9]/g, '');
      if (cleanText) user = `${cleanText}@s.whatsapp.net`;
    }
    if (!user) return msg.reply('✦ Responde a un mensaje o menciona a un usuario para promover.');

    await sock.groupParticipantsUpdate(msg.chat, [user], 'promote');
    await msg.reply('✦ Usuario promovido a administrador.');
  }
};
