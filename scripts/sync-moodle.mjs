import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const restore = args.find((arg) => arg.startsWith('--restore='));
const dashboard = args.includes('--dashboard');
if (args.some((arg) => arg !== '--apply' && arg !== '--dashboard' && arg !== restore) || (restore && args.includes('--apply'))) {
  throw new Error('Use --apply to deploy or --restore=BACKUP.json to restore; add --dashboard for the initial dashboard installation.');
}
let connection;
try {
  connection = JSON.parse(readFileSync(resolve(project, 'moodle/connection.local'), 'utf8'));
} catch {
  throw new Error('Create moodle/connection.local using moodle/connection.example.json.');
}
const { host, user, key, root, webUser, backupDir } = connection;
for (const [name, value] of Object.entries({ host, user, root, webUser, backupDir })) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_./:@-]+$/.test(value) || value.startsWith('-')) {
    throw new Error(`Invalid connection setting: ${name}`);
  }
}
if (!root.startsWith('/') || !backupDir.startsWith('/') || typeof key !== 'string') {
  throw new Error('root and backupDir must be absolute paths; key must name a local SSH key.');
}
const identity = key.startsWith('~/') ? resolve(homedir(), key.slice(2)) : resolve(project, key);
const target = `${user}@${host}`;
const sshOptions = ['-i', identity, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
  '-o', 'StrictHostKeyChecking=yes', '-o', 'ConnectTimeout=10'];
const quote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;
function run(program, argv) {
  const result = spawnSync(program, argv, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${program} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  if (result.stderr) process.stderr.write(result.stderr);
  return result.stdout;
}
async function fetchPublic(url) {
  const get = () => fetch(url, { signal: AbortSignal.timeout(30000), headers: { Connection: 'close' } });
  // Retry a dropped read connection once, including after a lengthy CSS build.
  return get().catch(() => get());
}
const ssh = (command) => run('ssh', [...sshOptions, target, command]);
const mode = restore || (args.includes('--apply') ? '--apply' : '--check');
const seasonalAssets = dashboard || restore ? [] : ['Spring', 'Summer', 'Fall', 'Winter'].map((name) => {
  const source = resolve(project, 'public/backgrounds', `${name}.jpg`);
  const hash = createHash('sha256').update(readFileSync(source)).digest('hex');
  return { source, staged: `${name}.jpg`, hash, season: name.toLowerCase(),
    filename: `${name.toLowerCase()}-${hash.slice(0, 12)}.jpg` };
});
const temporary = ssh('mktemp -d /tmp/ignite-moodle.XXXXXXXX').trim();
if (!/^\/tmp\/ignite-moodle\.[a-zA-Z0-9]+$/.test(temporary)) throw new Error('Invalid remote temporary path.');
let backup;
const php = (operation) => ssh(`cd /tmp && sudo -u ${quote(webUser)} php ${quote(`${temporary}/${dashboard ? 'install-dashboard.php' : 'sync.php'}`)} ${quote(root)} ${quote(backupDir)} ${quote(operation)}`);
const build = () => ssh(`cd /tmp && sudo -u ${quote(webUser)} php ${quote(`${temporary}/build-theme.php`)} ${quote(root)}`);
try {
  run('scp', [...sshOptions,
    ...['sync.php', 'install-dashboard.php', 'build-theme.php', 'raw.scss', 'theme.scss', 'authentication.html', 'dashboard-navigation.html', 'dashboard-welcome.html']
      .map((file) => resolve(project, 'moodle', file)),
    ...(mode === '--apply' ? seasonalAssets.map((asset) => asset.source) : []), `${target}:${temporary}/`]);
  if (seasonalAssets.length) {
    const manifest = Object.fromEntries(seasonalAssets.map((asset) => [asset.season, asset.filename]));
    ssh(`printf %s ${quote(JSON.stringify(manifest))} > ${quote(`${temporary}/seasonal-backgrounds.json`)}`);
  }
  // The staged files are public styling/code only. Backups are private to the web-server user.
  ssh(`chmod 755 ${quote(temporary)} && chmod 644 ${quote(temporary)}/*`);
  // Only prepare backup storage when a deployment or restore is requested.
  if (mode !== '--check') {
    ssh(`install -d -o ${quote(webUser)} -g ${quote(webUser)} -m 700 ${quote(backupDir)}`);
  }
  if (mode === '--apply' && seasonalAssets.length) {
    const uploadedHashes = ssh(`sha256sum ${seasonalAssets.map((asset) => quote(`${temporary}/${asset.staged}`)).join(' ')}`)
      .trim().split('\n').map((line) => line.split(/\s+/)[0]);
    if (seasonalAssets.some((asset, index) => asset.hash !== uploadedHashes[index])) {
      throw new Error('Seasonal background upload checksum mismatch. No settings were changed.');
    }
    const directory = `${root}/public/ignite-assets`;
    ssh([`install -d -m 755 ${quote(directory)}`,
      ...seasonalAssets.map((asset) => `install -m 644 ${quote(`${temporary}/${asset.staged}`)} ${quote(`${directory}/${asset.filename}`)}`)]
      .join(' && '));
    await Promise.all(seasonalAssets.map(async (asset) => {
      const response = await fetchPublic(`https://learn.ignitefindyourfire.org/ignite-assets/${asset.filename}`);
      const hash = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
      if (!response.ok || hash !== asset.hash) throw new Error(`Public ${asset.season} background verification failed.`);
    }));
    console.log('All four seasonal backgrounds uploaded and verified.');
  }
  const result = JSON.parse(php(mode));
  backup = result.backup;
  console.log(JSON.stringify(result, null, 2));
  if (result.changed) {
    if (!dashboard) {
      console.log('Compiling Moodle theme CSS in both directions…');
      try {
        process.stdout.write(build());
      } catch (error) {
        console.error('Theme compilation failed. Restoring the previous settings.');
        process.stdout.write(php(`--restore=${backup}`));
        process.stdout.write(build());
        throw error;
      }
    }
    const response = await fetchPublic(result.url + '/login/index.php');
    const html = await response.text();
    if (!response.ok || !html.includes('id="page-login-index"')) {
      throw new Error(`Post-deployment login-page check failed (HTTP ${response.status}). Backup: ${backup}`);
    }
    console.log(`Verified Moodle login page (HTTP ${response.status}).`);
  }
} finally {
  try { ssh(`rm -rf -- ${quote(temporary)}`); }
  catch (error) { console.error(`Could not remove staging directory ${temporary}: ${error.message}`); }
}
