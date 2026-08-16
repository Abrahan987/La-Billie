import translate from '@vitalets/google-translate-api';

export default {
  name: 'translate',
  command: ['translate', 'traducir', 'tr'],
  category: 'tools',
  description: 'Traduce texto a otro idioma',
  run: async ({ msg, args, text }) => {
    let lang = args[0] || 'es';
    let textToTranslate = text;

    if (msg.quoted && msg.quoted.text) {
      textToTranslate = msg.quoted.text;
    } else if (args.length > 1) {
      textToTranslate = args.slice(1).join(' ');
    }

    if (!textToTranslate) {
      return msg.reply('✦ Responde a un mensaje o ingresa el texto a traducir.');
    }

    try {
      const res = await translate(textToTranslate, { to: lang });
      await msg.reply(`✦ *Traducción (${res.from.language.iso} -> ${lang})*\n> ${res.text}`);
    } catch (e) {
      msg.reply(`✦ Error al traducir: ${e.message}`);
    }
  }
};
