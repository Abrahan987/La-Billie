import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";

global.botName = "BILLIE EILISH BOT";
global.ownerName = "ABRAHAN-M";
global.ownerNumber = "573237649689";
global.owner = [global.ownerNumber];

global.prefix = [".", "#", "/", "!"];

global.APIs = {
  yuki: { url: "https://api.yuki-wabot.my.id", key: "YukiBot-MD" },
  vreden: { url: "https://api.vreden.web.id", key: null },
  ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
  delirius: { url: "https://api.delirius.store", key: null },
  zenzxz: { url: "https://api.zenzxz.my.id", key: null },
  siputzx: { url: "https://app.siputzx.my.id", key: null }
};

global.mess = {
  owner: "✦ Este comando solo es para mi creador.",
  admin: "✦ Este comando solo es para administradores.",
  botAdmin: "✦ Necesito ser administrador para ejecutar este comando.",
  group: "✦ Este comando solo se puede usar en grupos.",
  private: "✦ Este comando solo se puede usar en chat privado."
};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  import(`${file}?update=${Date.now()}`);
});
