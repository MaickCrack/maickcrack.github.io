#!/usr/bin/env node
/*
  Copies the built site of every app marked `bundle: true` in js/config.js
  from its GitHub repo into apps/<id>/, so it runs as a standalone app.

  Usage:
    node tools/sync-apps.mjs              # every bundled app
    node tools/sync-apps.mjs solvane      # just one (by id)

  Assumes each project repo keeps its built site at the repo root
  (with any source code in source/, which is skipped).
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/config.js'), 'utf8'), sandbox);
const config = sandbox.window.PORTFOLIO;

const SKIP = new Set(['.git', '.github', 'source', 'node_modules', 'README.md', 'readme.md', 'LICENSE', '.nojekyll', '.gitignore']);
const only = process.argv.slice(2);
let count = 0;

for (const app of config.apps) {
  if (!app.bundle || !app.repo) continue;
  const id = app.id || app.repo.split('/')[1];
  if (only.length && !only.includes(id)) continue;
  if (typeof app.bundle === 'string' && !app.bundle.startsWith(`apps/${id}/`)) {
    console.log(`- ${id}: custom bundle path, skipped`);
    continue;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kos-'));
  try {
    execFileSync('git', ['clone', '--depth', '1', '--quiet', `https://github.com/${app.repo}.git`, tmp], { stdio: 'inherit' });
    if (!fs.existsSync(path.join(tmp, 'index.html'))) {
      console.log(`- ${id}: no index.html at the repo root, skipped`);
      continue;
    }
    const dest = path.join(root, 'apps', id);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(tmp)) {
      if (SKIP.has(name)) continue;
      fs.cpSync(path.join(tmp, name), path.join(dest, name), { recursive: true });
    }
    count++;
    console.log(`✓ ${app.repo} → apps/${id}/`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(count ? `Synced ${count} app${count === 1 ? '' : 's'}.` : 'Nothing to sync.');
