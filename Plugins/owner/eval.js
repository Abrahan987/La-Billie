import util from "util";

export default {
  command: ["eval", "e", ">"],
  category: "owner",
  description: "Ejecuta código JavaScript (Solo Owner)",
  isOwner: true,
  run: async (sock, m, { text, db }) => {
    if (!text) return m.reply("✦ Ingresa el código a ejecutar.");

    let evaled;
    try {
      evaled = await eval(`(async () => { ${text} })()`);
      if (typeof evaled !== "string") evaled = util.inspect(evaled);
      await m.reply(`✦ *Resultado:*\n\`\`\`js\n${evaled}\n\`\`\``);
    } catch (err) {
      await m.reply(`✖ *Error:*\n\`\`\`js\n${err?.stack || err}\n\`\`\``);
    }
  }
};
