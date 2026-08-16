export default {
  name: 'link',
  command: ['link', 'enlace'],
  category: 'group',
  description: 'Obtiene el enlace de invitación del grupo',
  botAdmin: true,
  run: async ({ msg, sock }) => {
    if (!msg.isGroup) return msg.reply(global.mess?.group || '✦ Este comando solo se puede usar en grupos.');
    try {
      const code = await sock.groupInviteCode(msg.chat);
      const link = `https://chat.whatsapp.com/${code}`;
      await msg.reply(`✦ Enlace de invitación del grupo:\n${link}`);
    } catch (e) {
      await msg.reply(`✦ Error al obtener el enlace: ${e.message}`);
    }
  }
};
