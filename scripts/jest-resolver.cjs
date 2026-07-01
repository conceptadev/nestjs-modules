'use strict';

// Custom Jest resolver for ESM-only @nestjs packages.
// NestJS v12 packages expose only "import" in their exports map.
// Jest's CJS runtime uses the "require" condition, which causes
// ERR_PACKAGE_PATH_NOT_EXPORTED. This resolver falls back to resolving
// the "import" (or "default") export path directly from the filesystem.

const path = require('path');
const fs = require('fs');

module.exports = function resolver(request, options) {
  try {
    return options.defaultResolver(request, options);
  } catch (err) {
    if (isExportsError(err)) {
      try {
        return resolveViaImportCondition(request, options);
      } catch {
        // fall through to re-throw original
      }
    }
    throw err;
  }
};

function isExportsError(err) {
  return (
    err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' ||
    (err.message &&
      (err.message.includes('not exported') ||
        err.message.includes('No "exports" main')))
  );
}

function resolveViaImportCondition(request, options) {
  const parts = request.split('/');
  const isScoped = request.startsWith('@');
  const pkgName = isScoped ? `${parts[0]}/${parts[1]}` : parts[0];
  const subpath =
    (isScoped ? parts.slice(2) : parts.slice(1)).join('/') || '';

  // Walk up from rootDir to find node_modules containing this package
  const pkgDir = findPackageDir(pkgName, options.rootDir);
  if (!pkgDir) {
    throw new Error(`Cannot find package directory for ${pkgName}`);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'),
  );

  const subpathKey = subpath ? `./${subpath}` : '.';
  const exportsEntry = pkg.exports?.[subpathKey];

  if (exportsEntry) {
    const importPath = resolveExportsEntry(exportsEntry);
    if (importPath) return path.resolve(pkgDir, importPath);
  }

  // Fallback to main field
  if (pkg.main && !subpath) {
    return path.resolve(pkgDir, pkg.main);
  }

  throw new Error(
    `Cannot resolve ${request} via import condition in ${pkgDir}`,
  );
}

function resolveExportsEntry(entry) {
  if (typeof entry === 'string') return entry;
  if (typeof entry !== 'object' || entry === null) return null;
  // Prefer "import" or "default" over "require" (since require condition is absent)
  for (const key of ['import', 'default', 'require']) {
    const val = entry[key];
    if (val) return resolveExportsEntry(val);
  }
  return null;
}

function findPackageDir(pkgName, startDir) {
  // Try rootDir/node_modules first (common in monorepos)
  const direct = path.join(startDir, 'node_modules', pkgName);
  if (fs.existsSync(path.join(direct, 'package.json'))) return direct;

  // Walk up the directory tree
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, 'node_modules', pkgName);
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
