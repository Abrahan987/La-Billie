import db from '#db';

export default {
  name: 'infobot',
  command: ['infobot', 'status', 'botinfo'],
  category: 'main',
  description: 'Muestra la información y estado general del bot',
  run: async ({ msg, sock }) => {
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botJid);
    const totalCmds = global.commands ? global.commands.size : 0;
    const executed = settings?.commandsejecut || 0;

    let info = `✦ *INFORMACIÓN DE ${global.botName}* ✦\n`;
    info += `✦ Creador: ${global.ownerName}\n`;
    info += `✦ Número Owner: +${global.ownerNumber}\n`;
    info += `✦ Comandos Cargados: ${totalCmds}\n`;
    info += `✦ Comandos Ejecutados: ${executed}\n`;
    info += `✦ Estado: Activo y Operativo`;

    await msg.reply(info);
  }
};
