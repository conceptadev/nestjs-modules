/**
 * Smoke test: validates that each v8 package's ESM build loads correctly.
 *
 * Loads directly from each package's dist/esm/ directory to test our actual
 * build output, bypassing node_modules workspace resolution.
 *
 * Checks:
 *  1. dist/esm/package.json has {"type":"module"}
 *  2. Relative imports in dist/esm/index.js have .js extensions
 *  3. import(dist/esm/index.js) loads without errors
 *  4. The expected Module class is exported and is a function
 *
 * Known limitation (NestJS v11): packages that contain deep subpath imports
 * (e.g. @nestjs/common/utils/shared.utils) will fail under Node.js ESM because
 * NestJS v11 has no exports map for those subpaths. These are flagged as
 * EXPECTED and will be resolved in Stage 2 when NestJS v12 is adopted.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
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

// Errors caused by NestJS v11 / rxjs lacking an exports map for deep subpaths.
// Not a bug in our build — will be resolved in Stage 2 (NestJS v12).
function isV11Limitation(err) {
  return (
    err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' ||
    (err.code === 'ERR_MODULE_NOT_FOUND' &&
      (err.message.includes('@nestjs/') || err.message.includes('rxjs/')))
  );
}

let passed = 0;
let expected = 0;
let failed = 0;

process.stdout.write('smoke-test-esm: validating ESM build\n\n');

for (const { dir, export: exportName } of PACKAGES) {
  const esmDir = join(ROOT, 'packages', dir, 'dist', 'esm');
  const indexPath = join(esmDir, 'index.js');

  // 1. Type marker
  const markerPath = join(esmDir, 'package.json');
  if (!existsSync(markerPath)) {
    process.stdout.write(`  FAIL  ${dir} — dist/esm/package.json missing (run yarn build first)\n`);
    failed++;
    continue;
  }
  const marker = JSON.parse(readFileSync(markerPath, 'utf8'));
  if (marker.type !== 'module') {
    process.stdout.write(`  FAIL  ${dir} — dist/esm/package.json has type "${marker.type}", expected "module"\n`);
    failed++;
    continue;
  }

  // 2. Spot-check .js extensions on relative imports in index.js
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf8');
    const bare = (content.match(/from ['"](\.[^'"]+)['"]/g) ?? []).filter(
      (m) => !/\.[cm]?js['"]/.test(m),
    );
    if (bare.length > 0) {
      process.stdout.write(
        `  FAIL  ${dir} — dist/esm/index.js has extensionless imports: ${bare.slice(0, 2).join(', ')}\n`,
      );
      failed++;
      continue;
    }
  }

  // 3. Dynamic import + export check
  try {
    const mod = await import(pathToFileURL(indexPath).href);
    if (typeof mod[exportName] !== 'function') {
      process.stdout.write(`  FAIL  ${dir} — ${exportName} is ${typeof mod[exportName]}, expected function\n`);
      failed++;
    } else {
      process.stdout.write(`  pass  ${dir} → ${exportName}\n`);
      passed++;
    }
  } catch (err) {
    if (isV11Limitation(err)) {
      process.stdout.write(`  exp.  ${dir} — NestJS v11: ${err.message.split('\n')[0]}\n`);
      expected++;
    } else {
      process.stdout.write(`  FAIL  ${dir} — ${err.message.split('\n')[0]}\n`);
      failed++;
    }
  }
}

process.stdout.write(`\n${passed} passed, ${expected} expected (NestJS v11), ${failed} failed\n`);
if (failed > 0) process.exit(1);
