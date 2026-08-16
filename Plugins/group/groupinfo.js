export default {
  name: 'groupinfo',
  command: ['groupinfo', 'infogp', 'gp'],
  category: 'group',
  description: 'Muestra información detallada del grupo',
  run: async ({ msg, groupMetadata }) => {
    if (!msg.isGroup) return msg.reply(global.mess?.group || '✦ Este comando solo se puede usar en grupos.');
    if (!groupMetadata) return msg.reply('✦ No se pudo obtener información del grupo.');

    const name = groupMetadata.subject;
    const owner = groupMetadata.owner ? `+${groupMetadata.owner.split('@')[0]}` : 'Desconocido';
    const total = groupMetadata.participants.length;
    const admins = groupMetadata.participants.filter(p => p.admin).length;

    let info = `✦ *INFORMACIÓN DEL GRUPO* ✦\n`;
    info += `✦ Nombre: ${name}\n`;
    info += `✦ Creador: ${owner}\n`;
    info += `✦ Miembros: ${total}\n`;
    info += `✦ Administradores: ${admins}`;

    await msg.reply(info);
  }
};
