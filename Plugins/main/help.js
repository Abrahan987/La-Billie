import db from '#db';

export default {
  name: 'help',
  command: ['help', 'menu'],
  category: 'main',
  description: 'Muestra el menú principal de comandos',
  run: async ({ msg, usedPrefix }) => {
    const categories = {};
    for (const [cmd, data] of global.commands) {
      const cat = data.category || 'general';
      if (!categories[cat]) categories[cat] = [];
      if (!categories[cat].includes(cmd)) categories[cat].push(cmd);
    }

    let menu = `✦ *${global.botName}* ✦\n`;
    menu += `✦ Creador: ${global.ownerName}\n`;
    menu += `✦ Prefijo: [ ${usedPrefix} ]\n\n`;

    for (const [cat, cmds] of Object.entries(categories)) {
      menu += `✦ *Menú ${cat.toUpperCase()}*\n`;
      menu += `> ${cmds.map(c => `${usedPrefix}${c}`).join(', ')}\n\n`;
    }

    menu += `✦ Disfruta usando ${global.botName}`;
    await msg.reply(menu);
  }
};
