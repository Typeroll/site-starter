import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, mkdir, readdir, rm, lstat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const REPOSITORY = 'Typeroll/site-starter';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const run = (command, args, cwd = ROOT) => execFileSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }).trim();
const hash = value => createHash('sha256').update(value).digest('hex');

export function assertOriginal(repository, remote) {
  if (repository && repository !== REPOSITORY) throw Error('Template synchronization cannot run in a customer repository');
  if (!['git@github.com:Typeroll/site-starter.git', 'https://github.com/Typeroll/site-starter.git', 'https://github.com/Typeroll/site-starter'].includes(remote)) throw Error('Origin must be exactly Typeroll/site-starter');
}

export function assertVersion(version, current) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Only an exact stable release version is supported');
  if (current) {
    const a = version.split('.').map(Number), b = current.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) break;
      if (a[i] < b[i]) throw Error('Refusing to downgrade the template');
    }
  }
}

export function validateGenerated(files, version) {
  const allowed = /^(AGENTS\.md|README\.md|decisions\.md|typeroll\.(json|lock\.json)|\.gitignore|(brief|workflows|sources|scripts|qa)\/([a-z0-9-]+|README)\.md)$/;
  for (const name of Object.keys(files)) if (!allowed.test(name)) throw Error(`Unexpected generated path: ${name}`);
  const lock = JSON.parse(files['typeroll.lock.json']);
  if (lock.schema_version !== 1 || lock.generator_version !== version) throw Error('Generator version/lock mismatch');
  for (const name of ['workflows/interview.md', 'workflows/new-site.md', 'workflows/migration.md', 'brief/interview.md', 'brief/rules.md', 'brief/seo.md', 'AGENTS.md', 'README.md']) {
    if (!files[name] || !lock.files[name]) throw Error(`Missing starter file: ${name}`);
  }
  for (const [name, digest] of Object.entries(lock.files)) {
    if (!(name in files) || hash(files[name]) !== digest) throw Error(`Generated content does not match lock: ${name}`);
  }
  for (const name of Object.keys(files)) {
    if (!['.gitignore', 'typeroll.json', 'typeroll.lock.json'].includes(name) && !lock.files[name]) throw Error(`Untracked generator file: ${name}`);
  }
  const config = JSON.parse(files['typeroll.json']);
  if (config.organization_id !== null || config.site_id !== null || config.version !== 'main' || config.portal !== 'https://app.typeroll.com') throw Error('Template must have no customer binding');
  return lock;
}

async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { Accept: 'application/json' } });
  if (!response.ok) throw Error(`Metadata HTTP ${response.status}: ${url}`);
  return response.json();
}

async function readTree(root, relative = '') {
  const result = {};
  for (const item of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, item.name);
    if (item.isDirectory()) Object.assign(result, await readTree(root, name));
    else if (item.isFile()) result[name] = await readFile(path.join(root, name), 'utf8');
    else throw Error(`Unexpected generated symlink: ${name}`);
  }
  return result;
}

export async function synchronize({ check = false, version: requested } = {}) {
  assertOriginal(process.env.GITHUB_REPOSITORY, run('git', ['remote', 'get-url', 'origin']));
  let current;
  try { current = JSON.parse(await readFile(path.join(ROOT, '.github/starter-source.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (requested && requested !== 'latest') assertVersion(requested, current?.version);
  const published = await json(`https://registry.npmjs.org/@typeroll%2fmcp-server/${requested || 'latest'}`);
  assertVersion(published.version, current?.version);
  if (published.name !== '@typeroll/mcp-server' || !/^[a-f0-9]{40}$/.test(published.gitHead || '')) throw Error('Missing package/source identity');
  let tag = (await json(`https://api.github.com/repos/Typeroll/typeroll/git/ref/tags/mcp-v${published.version}`)).object;
  if (tag.type === 'tag') tag = (await json(`https://api.github.com/repos/Typeroll/typeroll/git/tags/${tag.sha}`)).object;
  if (tag.type !== 'commit' || tag.sha !== published.gitHead) throw Error('npm source does not match the verified MCP release tag');
  const metadata = { package: published.name, version: published.version, source_commit: published.gitHead, integrity: published.dist.integrity };
  if (current?.version === metadata.version && JSON.stringify(current) !== JSON.stringify(metadata)) throw Error('Published release identity changed');
  const temp = await mkdtemp(path.join(os.tmpdir(), 'typeroll-site-starter-'));
  try {
    run('npm', ['exec', '--yes', '--ignore-scripts', `--package=@typeroll/mcp-server@${published.version}`, '--', 'typeroll', 'init', temp]);
    const files = await readTree(temp);
    validateGenerated(files, published.version);
    // README is deliberately project-owned for init --update; retain the original
    // generator hash so copies are never overwritten with the plain CLI README.
    files['README.md'] = await readFile(path.join(ROOT, '.github/template/intro.md'), 'utf8') + '\n' + files['README.md'];
    files['.github/starter-source.json'] = JSON.stringify(metadata, null, 2) + '\n';
    const changes = [];
    for (const [name, content] of Object.entries(files)) {
      let existing;
      // Refuse symlinks in destinations, including their parent directories.
      let segment = ROOT;
      for (const part of name.split('/')) {
        segment = path.join(segment, part);
        try { if ((await lstat(segment)).isSymbolicLink()) throw Error(`Refusing symlink: ${name}`); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      try { existing = await readFile(path.join(ROOT, name), 'utf8'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (existing === content) continue;
      changes.push(name);
    }
    if (check && changes.length) throw Error(`Template differs from MCP ${published.version}: ${changes.join(', ')}`);
    if (!check) for (const name of changes) {
      await mkdir(path.dirname(path.join(ROOT, name)), { recursive: true });
      await writeFile(path.join(ROOT, name), files[name]);
    }
    console.log(JSON.stringify({ version: published.version, source: published.gitHead, check, changed: changes }));
  } finally { await rm(temp, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { check: { type: 'boolean' }, version: { type: 'string' } } });
  await synchronize(values);
}
