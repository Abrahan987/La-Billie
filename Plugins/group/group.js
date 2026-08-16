export default {
  command: ["group", "grupo"],
  category: "group",
  description: "Abre o cierra el grupo (Solo admins)",
  isAdmin: true,
  botAdmin: true,
  run: async (sock, m, { args, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply(global.mess.group);

    const action = args[0]?.toLowerCase();
    if (action === "open" || action === "abrir") {
      await sock.groupSettingUpdate(m.chat, "not_announcement");
      await m.reply("✦ Grupo abierto exitosamente.");
    } else if (action === "close" || action === "cerrar") {
      await sock.groupSettingUpdate(m.chat, "announcement");
      await m.reply("✦ Grupo cerrado exitosamente.");
    } else {
      await m.reply(`✦ Opciones válidas:\n• ${usedPrefix}${command} abrir\n• ${usedPrefix}${command} cerrar`);
    }
  }
};
