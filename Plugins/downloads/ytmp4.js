import yts from 'yt-search';
import fetch from 'node-fetch';

export default {
  name: 'ytmp4',
  command: ['ytmp4', 'play2', 'ytvideo'],
  category: 'downloads',
  description: 'Descarga video de YouTube',
  run: async ({ msg, sock, text }) => {
    if (!text) return msg.reply('✦ Ingresa el nombre o URL del video de YouTube.');

    try {
      const search = await yts(text);
      const video = search.videos?.[0];
      if (!video) return msg.reply('✦ No se encontraron resultados.');

      await msg.reply(`✦ Descargando video: *${video.title}*`);

      const apiUrl = `https://api.lempi.lat/dl/ytv?url=${encodeURIComponent(video.url)}&apikey=montekey28`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json?.status || !json?.descarga?.url) {
        return msg.reply('✦ No se pudo obtener el video.');
      }

      await sock.sendMessage(msg.chat, {
        video: { url: json.descarga.url },
        mimetype: 'video/mp4',
        caption: `✦ *Video:* ${video.title}`
      }, { quoted: msg });
    } catch (e) {
      msg.reply(`✦ Error descargando video: ${e.message}`);
    }
  }
};
