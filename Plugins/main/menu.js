import moment from "moment-timezone";

export default {
  command: ["menu", "help"],
  category: "main",
  description: "Muestra el menú principal de BILLIE EILISH BOT",
  run: async (sock, m, { usedPrefix }) => {
    const time = moment().tz("America/Bogota").format("HH:mm:ss");
    const date = moment().tz("America/Bogota").format("DD/MM/YYYY");

    let menuText = `✦ BILLIE EILISH BOT ✦\n`;
    menuText += `━━━━━━━━━━━━━━━━━━━━━\n`;
    menuText += `👤 Creator: ${global.ownerName}\n`;
    menuText += `📅 Fecha: ${date}\n`;
    menuText += `⏰ Hora: ${time}\n`;
    menuText += `⚙ Prefijo: [ ${usedPrefix} ]\n`;
    menuText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const categories = {};
    for (const [cmdName, cmdInfo] of global.comandos.entries()) {
      const cat = cmdInfo.category || "general";
      if (!categories[cat]) categories[cat] = new Set();
      categories[cat].add(cmdName);
    }

    for (const [cat, cmds] of Object.entries(categories)) {
      menuText += `📌 *${cat.toUpperCase()}*\n`;
      for (const cmd of cmds) {
        menuText += `  • ${usedPrefix}${cmd}\n`;
      }
      menuText += `\n`;
    }

    menuText += `✦ Powered by ${global.ownerName}`;

    await m.reply(menuText);
  }
};
