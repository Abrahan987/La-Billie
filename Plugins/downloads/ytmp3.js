import yts from 'yt-search';
import fetch from 'node-fetch';

export default {
  name: 'ytmp3',
  command: ['ytmp3', 'play', 'ytaudio'],
  category: 'downloads',
  description: 'Descarga audio de YouTube',
  run: async ({ msg, sock, text }) => {
    if (!text) return msg.reply('✦ Ingresa el nombre o URL del video de YouTube.');

    try {
      const search = await yts(text);
      const video = search.videos?.[0];
      if (!video) return msg.reply('✦ No se encontraron resultados.');

      await msg.reply(`✦ Descargando audio: *${video.title}*`);

      const apiUrl = `https://api.lempi.lat/dl/yta?url=${encodeURIComponent(video.url)}&apikey=montekey28`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json?.status || !json?.descarga?.url) {
        return msg.reply('✦ No se pudo obtener el audio.');
      }

      const audioRes = await fetch(json.descarga.url);
      const buffer = await audioRes.buffer();

      await sock.sendMessage(msg.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: msg });
    } catch (e) {
      msg.reply(`✦ Error descargando audio: ${e.message}`);
    }
  }
};
