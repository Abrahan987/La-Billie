import fetch from 'node-fetch';

export default {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  category: 'downloads',
  description: 'Descarga un video de TikTok',
  run: async ({ msg, sock, text }) => {
    if (!text) return msg.reply('✦ Ingresa el enlace o término de búsqueda de TikTok.');

    try {
      const isUrl = /(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text);
      const endpoint = isUrl
        ? `${global.APIs.yuki.url}/dl/tiktok?url=${encodeURIComponent(text)}&key=${global.APIs.yuki.key}`
        : `${global.APIs.yuki.url}/search/tiktok?query=${encodeURIComponent(text)}&key=${global.APIs.yuki.key}`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (!json.status || !json.data) {
        return msg.reply('✦ No se encontró contenido en TikTok.');
      }

      if (isUrl) {
        const videoData = json.data;
        const videoUrl = Array.isArray(videoData.dl) ? videoData.dl[0] : videoData.dl;
        if (!videoUrl) return msg.reply('✦ No se pudo obtener el video.');

        await sock.sendMessage(msg.chat, {
          video: { url: videoUrl },
          caption: `✦ *TikTok:* ${videoData.title || 'Sin título'}`
        }, { quoted: msg });
      } else {
        const videoData = json.data?.[0];
        if (!videoData || !videoData.dl) return msg.reply('✦ No se encontraron resultados.');

        await sock.sendMessage(msg.chat, {
          video: { url: videoData.dl },
          caption: `✦ *TikTok:* ${videoData.title || 'Sin título'}`
        }, { quoted: msg });
      }
    } catch (e) {
      msg.reply(`✦ Error al descargar TikTok: ${e.message}`);
    }
  }
};
