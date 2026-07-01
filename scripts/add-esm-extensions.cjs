'use strict';
/**
 * Post-processes ESM build output to add .js extensions to extensionless
 * relative imports/exports. Required because source files use extensionless
 * imports (compatible with CJS build), but Node.js ESM requires explicit
 * file extensions.
 *
 * Processes both .js and .d.ts files under each package's dist/esm/ directory.
 */
const { readdirSync, readFileSync, writeFileSync, statSync, existsSync } = require('fs');
const { join, dirname } = require('path');

const ROOT = join(__dirname, '..');

/**
 * Walk a directory recursively and return all file paths.
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/**
 * Regex that matches relative import/export specifiers without file extensions.
 * Handles: from '...', from "...", import('...'), import("...")
 */
const RELATIVE_IMPORT_RE =
  /((?:\bfrom\s+|\bimport\s*\(\s*)(['"]))(\.\.?\/[^'"]+?)(\2)/g;

/**
 * Add .js extension to extensionless relative specifiers in file content.
 * Resolves directory index files (e.g. './domain' → './domain/index.js').
 * @param {string} content
 * @param {string} sourceFile - absolute path of the file being processed
 * @returns {string}
 */
function rewriteContent(content, sourceFile) {
  const sourceDir = dirname(sourceFile);
  return content.replace(
    RELATIVE_IMPORT_RE,
    (match, prefix, _quote, specifier, suffix) => {
      if (/\.[cm]?js$/.test(specifier) || specifier.endsWith('.json')) {
        return match;
      }
      const absPath = join(sourceDir, specifier);
      // Directory barrel: './foo' where foo/ exists → './foo/index.js'
      if (existsSync(absPath) && statSync(absPath).isDirectory()) {
        return `${prefix}${specifier}/index.js${suffix}`;
      }
      return `${prefix}${specifier}.js${suffix}`;
    },
  );
}

/**
 * Process all .js and .d.ts files in a dist/esm directory.
 * @param {string} esmDir
 * @param {string} pkgName
 */
function processPackage(esmDir, pkgName) {
  const files = walk(esmDir).filter(
    (f) => f.endsWith('.js') || f.endsWith('.d.ts'),
  );

  if (files.length === 0) return;

  let changed = 0;
  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const rewritten = rewriteContent(original, file);
    if (rewritten !== original) {
      writeFileSync(file, rewritten, 'utf8');
      changed++;
    }
  }

  process.stdout.write(
    `  ${pkgName}: processed ${files.length} files, rewrote ${changed}\n`,
  );
}

// Discover packages with a dist/esm directory
const packagesDir = join(ROOT, 'packages');
const pkgDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

process.stdout.write('add-esm-extensions: adding .js to relative imports\n');
for (const pkg of pkgDirs) {
  const esmDir = join(packagesDir, pkg, 'dist', 'esm');
  processPackage(esmDir, pkg);
}
process.stdout.write('done\n');
