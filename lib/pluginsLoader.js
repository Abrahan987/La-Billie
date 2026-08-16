import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsFolder = path.resolve(__dirname, '../Plugins');
const pluginCache = new Map();

global.comandos = global.comandos ?? new Map();
global.plugins = global.plugins ?? {};
global.cmdsExecute = global.cmdsExecute ?? [];

function registerModule(filePath, mod) {
  const key = path.relative(pluginsFolder, filePath).replace(/\\/g, '/').replace(/\.js$/, '');

  for (const [cmd, data] of global.comandos) {
    if (data.pluginKey === key) global.comandos.delete(cmd);
  }
  global.cmdsExecute = global.cmdsExecute.filter(p => p.key !== key);

  const cmd = mod?.default || mod;
  const dirname = path.dirname(filePath);

  const allFn = typeof cmd?.all === 'function' ? cmd.all : typeof mod?.all === 'function' ? mod.all : null;
  const beforeFn = typeof cmd?.before === 'function' ? cmd.before : typeof mod?.before === 'function' ? mod.before : null;

  global.plugins[key] = { ...mod, dirname, ...(beforeFn ? { before: beforeFn } : {}), ...(allFn ? { all: allFn } : {}) };

  if (allFn) global.cmdsExecute.push({ key, type: 'all', fn: allFn, dirname });
  if (beforeFn) global.cmdsExecute.push({ key, type: 'before', fn: beforeFn, dirname });

  if (typeof cmd?.run !== 'function') return;

  const cmds = Array.isArray(cmd.command) ? cmd.command : cmd.command ? [cmd.command] : [];
  const keys = cmds.filter(Boolean).map(c => c.toLowerCase());

  if (!keys.length) return;

  for (const c of keys) {
    global.comandos.set(c, {
      pluginKey: key,
      run: cmd.run,
      category: cmd.category ?? 'general',
      description: cmd.description ?? '',
      isOwner: cmd.isOwner ?? false,
      isAdmin: cmd.isAdmin ?? false,
      botAdmin: cmd.botAdmin ?? false,
      customPrefix: cmd.customPrefix ?? null,
    });
  }
}

async function importModule(filePath) {
  const mtime = fs.statSync(filePath).mtimeMs;
  const cached = pluginCache.get(filePath);
  if (cached?.mtime === mtime) return cached.mod;
  const url = `${pathToFileURL(filePath).href}?v=${mtime}`;
  const mod = await import(url);
  pluginCache.set(filePath, { mtime, mod });
  return mod;
}

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { collectFiles(full, out); continue; }
    if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

export default async function pluginsLoader() {
  const t = Date.now();
  if (!fs.existsSync(pluginsFolder)) {
    fs.mkdirSync(pluginsFolder, { recursive: true });
  }
  const files = collectFiles(pluginsFolder);
  const results = await Promise.allSettled(files.map(async (filePath) => {
    const mod = await importModule(filePath);
    registerModule(filePath, mod);
  }));
  let errCount = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      errCount++;
      console.error(chalk.gray(`✦ Error cargando ${path.basename(files[i])}: ${results[i].reason?.message ?? results[i].reason}`));
    }
  }
  const ms = Date.now() - t;
  console.log(chalk.gray(`✦ ${global.comandos.size}/${files.length} plugins cargados en ${ms}ms${errCount > 0 ? ` · ${errCount} con errores` : ''}`));
}
