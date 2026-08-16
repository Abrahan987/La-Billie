export default {
  command: ["ping", "p"],
  category: "main",
  description: "Verifica el tiempo de respuesta del bot",
  run: async (sock, m) => {
    const start = Date.now();
    const msg = await m.reply("⚡ Calculando latencia...");
    const end = Date.now();
    const latency = end - start;
    await sock.sendMessage(m.chat, { text: `✦ Latencia: ${latency} ms` }, { quoted: msg });
  }
};
