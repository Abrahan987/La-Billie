import { exec } from 'child_process';

export default {
  name: 'exec',
  command: ['>'],
  category: 'owner',
  description: 'Ejecuta comandos de consola en el servidor',
  isOwner: true,
  run: async ({ msg, text }) => {
    if (!text) return msg.reply('✦ Ingresa el comando a ejecutar.');
    exec(text, (err, stdout, stderr) => {
      if (err) return msg.reply(`✦ Error:\n${err.message}`);
      if (stderr) return msg.reply(`✦ Stderr:\n${stderr}`);
      msg.reply(`✦ Salida:\n${stdout || 'Ejecutado sin salida.'}`);
    });
  }
};
