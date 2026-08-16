export default {
  name: 'hidetag',
  command: ['hidetag', 'notify'],
  category: 'group',
  description: 'Notifica a todos los miembros del grupo',
  isAdmin: true,
  run: async ({ msg, sock, text, groupMetadata }) => {
    if (!msg.isGroup) return msg.reply(global.mess?.group || '✦ Este comando solo se puede usar en grupos.');
    const participants = groupMetadata?.participants || [];
    const mentions = participants.map(p => p.id);
    const notificationText = text || '✦ Atención a todos los miembros.';

    await sock.sendMessage(msg.chat, {
      text: notificationText,
      mentions
    });
  }
};
