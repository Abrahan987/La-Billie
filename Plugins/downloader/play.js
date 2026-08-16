import yts from "yt-search";

export default {
  command: ["play"],
  category: "downloader",
  description: "Busca y reproduce una canción desde YouTube",
  run: async (sock, m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`✦ Uso correcto: ${usedPrefix}${command} <nombre o enlace>`);

    await m.reply(global.mess.wait);

    try {
      const search = await yts(text);
      const vid = search.videos[0];

      if (!vid) return m.reply("✖ No se encontraron resultados.");

      let info = `✦ *${vid.title}*\n`;
      info += `⏱ Duración: ${vid.timestamp}\n`;
      info += `👁 Vistas: ${vid.views.toLocaleString()}\n`;
      info += `🔗 Link: ${vid.url}\n`;

      await sock.sendMessage(m.chat, {
        image: { url: vid.thumbnail },
        caption: info
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await m.reply(global.mess.error);
    }
  }
};
