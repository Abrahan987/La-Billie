import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";

// Owner configuration
global.ownerName = "ABRAHAN-M";
global.ownerNumber = "573237649689";
global.owner = [global.ownerNumber];

// Bot configuration
global.botName = "BILLIE EILISH BOT";
global.botVersion = "1.0.0";
global.prefix = ["/", "!", ".", "#"];

// Credits & Links
global.dev = "✦ BILLIE EILISH BOT ✦";
global.links = {
  api: 'https://api.yuki-wabot.my.id',
  github: "https://github.com/ABRAHAN-M"
};

// APIs & Keys retained from source
global.APIs = {
  yuki: { url: "https://api.yuki-wabot.my.id", key: "YukiBot-MD" },
  vreden: { url: "https://api.vreden.web.id", key: null },
  ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
  delirius: { url: "https://api.delirius.store", key: null },
  zenzxz: { url: "https://api.zenzxz.my.id", key: null },
  siputzx: { url: "https://app.siputzx.my.id", key: null }
};

// Standardized decorated messages (max 1-2 unicodes per line)
global.mess = {
  owner: '✦ Este comando es solo para mi creador ABRAHAN-M.',
  admin: '✦ Comando exclusivo para administradores del grupo.',
  botAdmin: '✦ Necesito permisos de administrador para ejecutar esto.',
  group: '✦ Este comando solo puede ser usado en grupos.',
  private: '✦ Este comando solo funciona en chats privados.',
  wait: '⏳ Procesando tu solicitud, por favor espera...',
  error: '✖ Ocurrió un error al procesar el comando.'
};

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  import(`${file}?update=${Date.now()}`);
});
