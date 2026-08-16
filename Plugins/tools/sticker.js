import { writeExifImg, writeExifVid } from '#exif';
import fs from 'fs';
import path from 'path';

export default {
  name: 'sticker',
  command: ['sticker', 's', 'stiker'],
  category: 'tools',
  description: 'Convierte imagen o video en sticker',
  run: async ({ msg, sock }) => {
    try {
      const q = msg.quoted ? msg.quoted : msg;
      const mime = (q.msg || q).mimetype || '';

      if (!/image|video|webp/.test(mime)) {
        return msg.reply('✦ Responde a una imagen, video o gif para crear un sticker.');
      }

      const media = await q.download();
      if (!media) return msg.reply('✦ No se pudo descargar el archivo.');

      const pack = global.botName;
      const author = global.ownerName;

      if (/image|webp/.test(mime)) {
        const sticker = await writeExifImg(media, { packname: pack, author });
        await sock.sendMessage(msg.chat, { sticker: { url: sticker } }, { quoted: msg });
        if (fs.existsSync(sticker)) fs.unlinkSync(sticker);
      } else if (/video/.test(mime)) {
        if ((q.msg || q).seconds > 15) {
          return msg.reply('✦ El video no debe durar más de 15 segundos.');
        }
        const sticker = await writeExifVid(media, { packname: pack, author });
        await sock.sendMessage(msg.chat, { sticker: { url: sticker } }, { quoted: msg });
        if (fs.existsSync(sticker)) fs.unlinkSync(sticker);
      }
    } catch (e) {
      msg.reply(`✦ Error al crear el sticker: ${e.message}`);
    }
  }
};
