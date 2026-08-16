import { writeExifImg } from "#exif";

export default {
  command: ["sticker", "s"],
  category: "sticker",
  description: "Convierte imágenes o videos cortos en stickers",
  run: async (sock, m) => {
    try {
      let q = m.quoted ? m.quoted : m;
      let mime = (q.msg || q).mimetype || "";

      if (!/image|video/.test(mime)) {
        return m.reply("✦ Responde a una imagen o video corto para crear un sticker.");
      }

      let media = await q.download();
      if (!media) return m.reply("✖ Error al descargar el contenido multimedia.");

      let stickerPath = await writeExifImg(media, {
        packname: global.botName,
        author: global.ownerName
      });

      if (stickerPath) {
        await sock.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m });
      } else {
        await m.reply("✖ No se pudo procesar la conversión a sticker.");
      }
    } catch (e) {
      console.error(e);
      await m.reply(global.mess.error);
    }
  }
};
