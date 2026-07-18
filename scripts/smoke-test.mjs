/**
 * Smoke test: validates that each v8 package's ESM build loads correctly.
 *
 * Loads directly from each package's dist/ directory to test our actual
 * build output, bypassing node_modules workspace resolution.
 *
 * Checks:
 *  1. package.json has {"type":"module"}
 *  2. exports map: all default (.js) and types (.d.ts) files exist on disk
 *  3. Relative imports in dist/index.js have .js extensions
 *  4. import(dist/index.js) loads and the expected Module class is a function
 *  5. Each subpath entry (./aggregate, ./optional/crud, etc.) loads without error
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

let passed = 0;
let failed = 0;

process.stdout.write('smoke-test: validating ESM build\n\n');

for (const { dir, export: exportName } of PACKAGES) {
  const pkgDir = join(ROOT, 'packages', dir);
  const distDir = join(pkgDir, 'dist');
  const indexPath = join(distDir, 'index.js');

  // 1. Type marker
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  if (pkg.type !== 'module') {
    process.stdout.write(`  FAIL  ${dir} — package.json has type "${pkg.type}", expected "module"\n`);
    failed++;
    continue;
  }

  // 2. Walk exports map: verify all default (.js) and types (.d.ts) files exist on disk
  let mapOk = true;
  for (const [subpath, entry] of Object.entries(pkg.exports ?? {})) {
    const jsFile = entry?.default;
    const dtsFile = entry?.types;
    if (jsFile && !existsSync(join(pkgDir, jsFile))) {
      process.stdout.write(`  FAIL  ${dir} — exports["${subpath}"].default not on disk (run yarn build first): ${jsFile}\n`);
      failed++;
      mapOk = false;
    }
    if (dtsFile && !existsSync(join(pkgDir, dtsFile))) {
      process.stdout.write(`  FAIL  ${dir} — exports["${subpath}"].types not on disk: ${dtsFile}\n`);
      failed++;
      mapOk = false;
    }
  }
  if (!mapOk) continue;

  // 3. Spot-check .js extensions on relative imports in index.js
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf8');
    const bare = (content.match(/from ['"](\.[^'"]+)['"]/g) ?? []).filter(
      (m) => !/\.[cm]?js['"]/.test(m),
    );
    if (bare.length > 0) {
      process.stdout.write(
        `  FAIL  ${dir} — dist/index.js has extensionless imports: ${bare.slice(0, 2).join(', ')}\n`,
      );
      failed++;
      continue;
    }
  }

  // 4. Dynamic import + main export check
  try {
    const mod = await import(pathToFileURL(indexPath).href);
    if (typeof mod[exportName] !== 'function') {
      process.stdout.write(`  FAIL  ${dir} — ${exportName} is ${typeof mod[exportName]}, expected function\n`);
      failed++;
      continue;
    }
    process.stdout.write(`  pass  ${dir} → ${exportName}\n`);
    passed++;
  } catch (err) {
    process.stdout.write(`  FAIL  ${dir} — ${err.message.split('\n')[0]}\n`);
    failed++;
    continue;
  }

  // 5. Load each subpath entry and verify it loads without error.
  // ./testing subpaths use vitest/vitest-mock-extended and can only run inside a
  // Vitest test run — files are already verified to exist on disk in step 2, so
  // loading is skipped here.
  for (const [subpath, entry] of Object.entries(pkg.exports ?? {})) {
    if (subpath === '.' || subpath === './testing') continue;
    const jsFile = entry?.default;
    if (!jsFile) continue;
    try {
      await import(pathToFileURL(join(pkgDir, jsFile)).href);
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
