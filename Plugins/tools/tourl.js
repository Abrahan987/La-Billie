import FormData from 'form-data';
import axios from 'axios';

const uploadUguu = async (buffer, filename = 'file.png') => {
  const form = new FormData();
  form.append("files[]", buffer, filename);
  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders()
  });
  const url = res.data?.files?.[0]?.url;
  if (!url) throw new Error("No se pudo obtener URL.");
  return url;
};

export default {
  name: 'tourl',
  command: ['tourl', 'url'],
  category: 'tools',
  description: 'Convierte imagen o video en enlace URL',
  run: async ({ msg }) => {
    const q = msg.quoted ? msg.quoted : msg;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) {
      return msg.reply('✦ Responde a una imagen o video para subirlo a URL.');
    }

    try {
      const buffer = await q.download();
      if (!buffer) return msg.reply('✦ No se pudo descargar el archivo.');

      const url = await uploadUguu(buffer);
      await msg.reply(`✦ *Archivo subido con éxito*\n> Enlace: ${url}`);
    } catch (e) {
      msg.reply(`✦ Error al subir el archivo: ${e.message}`);
    }
  }
};
