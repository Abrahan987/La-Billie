export default {
  name: 'restart',
  command: ['restart', 'reiniciar'],
  category: 'owner',
  description: 'Reinicia el proceso del bot',
  isOwner: true,
  run: async ({ msg }) => {
    await msg.reply('✦ Reiniciando el bot...');
    process.exit(0);
  }
};
