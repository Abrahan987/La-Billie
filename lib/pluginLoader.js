import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsFolder = path.resolve(__dirname, '../Plugins');
const pluginCache = new Map();
const debounceMap = new Map();
const watchers = new Map();

global.plugins = global.plugins ?? new Map();
global.commands = global.commands ?? new Map();
global.middlewares = global.middlewares ?? [];

function registerPlugin(filePath, mod) {
  const key = path.relative(pluginsFolder, filePath).replace(/\\/g, '/').replace(/\.js$/, '');

  for (const [cmd, data] of global.commands) {
    if (data.pluginKey === key) global.commands.delete(cmd);
  }
  global.middlewares = global.middlewares.filter(m => m.key !== key);

  const plugin = mod?.default ?? mod;
  const dirname = path.dirname(filePath);

  global.plugins.set(key, { ...mod, plugin, dirname });

  if (typeof plugin?.before === 'function') {
    global.middlewares.push({ key, type: 'before', fn: plugin.before, dirname });
  }
  if (typeof plugin?.all === 'function') {
    global.middlewares.push({ key, type: 'all', fn: plugin.all, dirname });
  }

  if (typeof plugin?.run !== 'function') return;

  const cmds = Array.isArray(plugin.command) ? plugin.command : plugin.command ? [plugin.command] : [];
  if (!cmds.length) return;

  for (const c of cmds) {
    global.commands.set(c.toLowerCase(), {
      pluginKey: key,
      name: plugin.name || c,
      run: plugin.run,
      category: plugin.category || 'general',
      description: plugin.description || '',
      isOwner: plugin.isOwner || false,
      isAdmin: plugin.isAdmin || false,
      botAdmin: plugin.botAdmin || false,
    });
  }
}

async function importPlugin(filePath) {
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
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

async function scan(dir) {
  const files = collectFiles(dir);
  const results = await Promise.allSettled(files.map(async (file) => {
    const mod = await importPlugin(file);
    registerPlugin(file, mod);
  }));

  let errors = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      errors++;
      console.error(chalk.red(`✦ Error cargando ${path.basename(files[i])}: ${results[i].reason?.message || results[i].reason}`));
    }
  }
  return { total: files.length, errors };
}

async function reloadPlugin(filePath) {
  if (!filePath.endsWith('.js')) return;
  if (!fs.existsSync(filePath)) {
    pluginCache.delete(filePath);
    const key = path.relative(pluginsFolder, filePath).replace(/\\/g, '/').replace(/\.js$/, '');
    for (const [cmd, data] of global.commands) {
      if (data.pluginKey === key) global.commands.delete(cmd);
    }
    global.middlewares = global.middlewares.filter(m => m.key !== key);
    global.plugins.delete(key);
    console.log(chalk.yellow(`✦ Plugin eliminado: ${path.basename(filePath)}`));
    return;
  }

  try {
    const mod = await importPlugin(filePath);
    registerPlugin(filePath, mod);
    console.log(chalk.green(`✦ Plugin recargado: ${path.basename(filePath)}`));
  } catch (e) {
    console.error(chalk.red(`✦ Error recargando ${path.basename(filePath)}: ${e.message}`));
  }
}

function watchDir(dir) {
  if (watchers.has(dir) || !fs.existsSync(dir)) return;
  try {
    const w = fs.watch(dir, (event, filename) => {
      if (filename?.endsWith('.js')) {
        const fullPath = path.join(dir, filename);
        if (debounceMap.has(fullPath)) clearTimeout(debounceMap.get(fullPath));
        debounceMap.set(fullPath, setTimeout(() => {
          debounceMap.delete(fullPath);
          reloadPlugin(fullPath).catch(() => {});
        }, 300));
      }
    });
    w.unref();
    watchers.set(dir, w);
  } catch {}

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) watchDir(path.join(dir, entry.name));
  }
}

export default async function loadPlugins() {
  const start = Date.now();
  if (!fs.existsSync(pluginsFolder)) {
    fs.mkdirSync(pluginsFolder, { recursive: true });
  }
  const { total, errors } = await scan(pluginsFolder);
  const time = Date.now() - start;
  console.log(chalk.cyan(`✦ ${global.commands.size} comandos cargados desde ${total} plugins (${time}ms)`));
  watchDir(pluginsFolder);
}
