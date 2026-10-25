import test from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertOriginal, assertVersion, validateGenerated } from './sync.mjs';

test('refuses customer repositories even when origin points at the upstream', () => {
  assertOriginal('Typeroll/site-starter', 'https://github.com/Typeroll/site-starter.git');
  assertOriginal('Typeroll/site-starter', 'https://github.com/Typeroll/site-starter');
  assert.throws(() => assertOriginal('customer/site', 'https://github.com/Typeroll/site-starter.git'));
  assert.throws(() => assertOriginal(undefined, 'git@github.com:customer/site.git'));
  assert.throws(() => assertOriginal('Typeroll/site-starter', 'https://github.com/Typeroll/site-starter.git.evil'));
});

test('allows stable upgrades and refuses prereleases, ranges and downgrades', () => {
  for (const version of ['0.45.77','0.45.78','0.46.0','1.0.0']) assertVersion(version, '0.45.77');
  for (const version of ['0.45.76','0.44.99','latest','0.46.0-beta','^0.45.77']) assert.throws(() => assertVersion(version, '0.45.77'));
});

test('committed workspace matches its source hashes; modified or unsafe files fail', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const lock = JSON.parse(await readFile(path.join(root,'typeroll.lock.json'),'utf8'));
  const files = {};
  for(const name of [...Object.keys(lock.files),'.gitignore','typeroll.json','typeroll.lock.json']) files[name]=await readFile(path.join(root,name),'utf8');
  const intro = await readFile(new URL('./intro.md',import.meta.url),'utf8');
  assert(files['README.md'].startsWith(intro+'\n'));
  files['README.md']=files['README.md'].slice(intro.length+1);
  validateGenerated(files,lock.generator_version);
  const toolName = 'scripts/typeroll/check_unsaved.py';
  const tool = '# read-only synthetic helper\n';
  const extendedLock = {...lock, files:{...lock.files,[toolName]:createHash('sha256').update(tool).digest('hex')}};
  validateGenerated({...files,[toolName]:tool,'typeroll.lock.json':JSON.stringify(extendedLock)},lock.generator_version);
  for (const name of ['scripts/typeroll/../../secret.py','scripts/typeroll/.env','scripts/typeroll/install.sh','scripts/typeroll/node_modules/bad.cjs']) {
    assert.throws(()=>validateGenerated({...files,[name]:'bad'},lock.generator_version));
  }
  assert.throws(()=>validateGenerated({...files,'AGENTS.md':'changed'},lock.generator_version));
  assert.throws(()=>validateGenerated({...files,'../secret':'bad'},lock.generator_version));
  assert.throws(()=>validateGenerated({...files,'.github/workflows/injected.yml':'bad'},lock.generator_version));
  const config=JSON.parse(files['typeroll.json']);config.site_id='customer-site';
  assert.throws(()=>validateGenerated({...files,'typeroll.json':JSON.stringify(config)},lock.generator_version));
  for(const name of await readdir(path.join(root,'.github/workflows'))) {
    const workflow=await readFile(path.join(root,'.github/workflows',name),'utf8');
    assert(workflow.includes("github.repository == 'Typeroll/site-starter'"),`${name} lacks copy guard`);
    assert(!workflow.includes('pull_request_target'));
  }
});
