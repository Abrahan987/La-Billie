export default {
  name: 'ping',
  command: ['ping', 'p'],
  category: 'main',
  description: 'Comprueba el tiempo de respuesta del bot',
  run: async ({ msg, sock }) => {
    const start = Date.now();
    const sent = await msg.reply('✦ Calculando latencia...');
    const latency = Date.now() - start;
    if (sent?.key) {
      await sock.sendMessage(msg.chat, {
        text: `✦ Pong! Latencia: ${latency}ms`,
        edit: sent.key
      }, { quoted: msg });
    } else {
      await msg.reply(`✦ Pong! Latencia: ${latency}ms`);
    }
  }
};
