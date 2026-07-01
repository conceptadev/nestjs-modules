'use strict';
/**
 * Injects package.json "type" markers into dist/cjs and dist/esm directories.
 * Node.js uses these to determine how to interpret .js files:
 *   dist/cjs/package.json  → { "type": "commonjs" }
 *   dist/esm/package.json  → { "type": "module" }
 *
 * Only writes files that don't already have the correct content.
 */
const { readdirSync, writeFileSync, mkdirSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');

const MARKERS = [
  { dir: 'dist/cjs', content: '{"type":"commonjs"}\n' },
  { dir: 'dist/esm', content: '{"type":"module"}\n' },
];

const pkgDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

process.stdout.write('inject-pkg-type: writing package.json type markers\n');
for (const pkg of pkgDirs) {
  for (const { dir, content } of MARKERS) {
    const distDir = join(PACKAGES_DIR, pkg, dir);
    if (!existsSync(distDir)) continue;
    const target = join(distDir, 'package.json');
    let existing;
    try {
      existing = readFileSync(target, 'utf8');
    } catch {
      existing = null;
    }
    if (existing !== content) {
      writeFileSync(target, content, 'utf8');
      process.stdout.write(`  ${pkg}/${dir}/package.json\n`);
    }
  }
}
process.stdout.write('done\n');
