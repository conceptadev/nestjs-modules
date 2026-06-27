'use strict';
/**
 * Smoke test: validates that each v8 package's CJS build loads correctly.
 *
 * Loads directly from each package's dist/cjs/ directory to test our actual
 * build output, bypassing node_modules workspace resolution.
 *
 * Checks:
 *  1. dist/cjs/package.json has {"type":"commonjs"}
 *  2. dist/cjs/index.js loads without errors
 *  3. The expected Module class is exported and is a function
 */
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

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
  const cjsDir = join(ROOT, 'packages', dir, 'dist', 'cjs');
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

  // 2. Load and check export
  try {
    const mod = require(indexPath);
    if (typeof mod[exportName] !== 'function') {
      process.stdout.write(`  FAIL  ${dir} — ${exportName} is ${typeof mod[exportName]}, expected function\n`);
      failed++;
    } else {
      process.stdout.write(`  pass  ${dir} → ${exportName}\n`);
      passed++;
    }
  } catch (err) {
    process.stdout.write(`  FAIL  ${dir} — ${err.message}\n`);
    failed++;
  }
}

process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
