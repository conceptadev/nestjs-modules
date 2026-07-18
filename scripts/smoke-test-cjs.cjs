'use strict';
/**
 * Smoke test: validates that each v8 package's CJS build loads correctly.
 *
 * Loads directly from each package's dist/cjs/ directory to test our actual
 * build output, bypassing node_modules workspace resolution.
 *
 * Checks:
 *  1. dist/cjs/package.json has {"type":"commonjs"}
 *  2. exports map: all require.default (.js) and require.types (.d.ts) files exist on disk
 *  3. dist/cjs/index.js loads and the expected Module class is a function
 *  4. Each subpath entry (./aggregate, ./optional/crud, etc.) loads without error
 */
const Module = require('module');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// @nestjs/config@12 ships only an "import" export condition; no "require".
// Node 25 can load ESM via require() natively, but ERR_PACKAGE_PATH_NOT_EXPORTED
// is thrown before it gets to load the file. This hook catches that error for
// @nestjs/* packages and manually resolves via the "import" condition.
const _origResolveFilename = Module._resolveFilename.bind(Module);
Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  try {
    return _origResolveFilename(request, parent, isMain, options);
  } catch (err) {
    if (err.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED' && err.code !== 'ERR_MODULE_NOT_FOUND') throw err;
    const pkgName = request.startsWith('@') ? request.split('/').slice(0, 2).join('/') : request.split('/')[0];
    if (!pkgName.startsWith('@nestjs/')) throw err;
    const subpath = request === pkgName ? '.' : '.' + request.slice(pkgName.length);
    const searchPaths = (parent && parent.paths) ? parent.paths : Module._nodeModulePaths(process.cwd());
    for (const nmDir of searchPaths) {
      const pkgDir = join(nmDir, ...pkgName.split('/'));
      const pkgJsonPath = join(pkgDir, 'package.json');
      if (!existsSync(pkgJsonPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
      const entry = pkg.exports?.[subpath];
      if (!entry) continue;
      const resolved = typeof entry === 'string' ? entry : (entry.import ?? entry.default ?? entry.require);
      if (!resolved) continue;
      return join(pkgDir, resolved);
    }
    throw err;
  }
};

const ROOT = join(__dirname, '..');

const PACKAGES = [
  { dir: 'nestjs-core', export: 'CoreModule' },
  { dir: 'nestjs-repository', export: 'RepositoryModule' },
  { dir: 'nestjs-repository-typeorm', export: 'TypeOrmRepositoryModule' },
  { dir: 'nestjs-crud', export: 'CrudModule' },
  { dir: 'nestjs-cache', export: 'CacheModule' },
  { dir: 'nestjs-otp', export: 'OtpModule' },
  { dir: 'nestjs-role', export: 'RoleModule' },
  { dir: 'nestjs-password', export: 'PasswordModule' },
  { dir: 'nestjs-user', export: 'UserModule' },
  { dir: 'nestjs-invitation', export: 'InvitationModule' },
  { dir: 'nestjs-federated', export: 'FederatedModule' },
  { dir: 'nestjs-authentication', export: 'AuthenticationModule' },
  { dir: 'nestjs-access-control', export: 'AccessControlModule' },
];

let passed = 0;
let failed = 0;

process.stdout.write('smoke-test-cjs: validating CJS build\n\n');

for (const { dir, export: exportName } of PACKAGES) {
  const pkgDir = join(ROOT, 'packages', dir);
  const cjsDir = join(pkgDir, 'dist', 'cjs');
  const indexPath = join(cjsDir, 'index.js');

  // 1. Type marker
  const markerPath = join(cjsDir, 'package.json');
  if (!existsSync(markerPath)) {
    process.stdout.write(`  FAIL  ${dir} — dist/cjs/package.json missing (run yarn build first)\n`);
    failed++;
    continue;
  }
  const marker = JSON.parse(readFileSync(markerPath, 'utf8'));
  if (marker.type !== 'commonjs') {
    process.stdout.write(`  FAIL  ${dir} — dist/cjs/package.json has type "${marker.type}", expected "commonjs"\n`);
    failed++;
    continue;
  }

  // 2. Walk exports map: verify all require.default (.js) and require.types (.d.ts) files exist on disk
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  let mapOk = true;
  for (const [subpath, entry] of Object.entries(pkg.exports ?? {})) {
    const jsFile = entry?.require?.default;
    const dtsFile = entry?.require?.types;
    if (jsFile && !existsSync(join(pkgDir, jsFile))) {
      process.stdout.write(`  FAIL  ${dir} — exports["${subpath}"].require.default not on disk: ${jsFile}\n`);
      failed++;
      mapOk = false;
    }
    if (dtsFile && !existsSync(join(pkgDir, dtsFile))) {
      process.stdout.write(`  FAIL  ${dir} — exports["${subpath}"].require.types not on disk: ${dtsFile}\n`);
      failed++;
      mapOk = false;
    }
  }
  if (!mapOk) continue;

  // 3. Load main entry and verify named export
  try {
    const mod = require(indexPath);
    if (typeof mod[exportName] !== 'function') {
      process.stdout.write(`  FAIL  ${dir} — ${exportName} is ${typeof mod[exportName]}, expected function\n`);
      failed++;
      continue;
    }
    process.stdout.write(`  pass  ${dir} → ${exportName}\n`);
    passed++;
  } catch (err) {
    process.stdout.write(`  FAIL  ${dir} — ${err.message}\n`);
    failed++;
    continue;
  }

  // 4. Load each subpath entry and verify it loads without error.
  // ./testing subpaths use vitest/vitest-mock-extended and can only run inside a
  // Vitest test run — files are already verified to exist on disk in step 2, so
  // loading is skipped here.
  for (const [subpath, entry] of Object.entries(pkg.exports ?? {})) {
    if (subpath === '.' || subpath === './testing') continue;
    const jsFile = entry?.require?.default;
    if (!jsFile) continue;
    try {
      require(join(pkgDir, jsFile));
      process.stdout.write(`  pass  ${dir} ${subpath}\n`);
      passed++;
    } catch (err) {
      process.stdout.write(`  FAIL  ${dir} ${subpath} — ${err.message.split('\n')[0]}\n`);
      failed++;
    }
  }
}

process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
