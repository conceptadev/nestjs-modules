'use strict';

// Custom Jest transformer for @nestjs JS files.
// NestJS v12 is pure ESM and uses import.meta.url, which TypeScript's
// module:CommonJS transform does not polyfill. We patch it before handing
// the source to TypeScript's transpileModule so Jest's CJS runtime can load it.
//
// MAINTENANCE NOTE: This is a temporary shim; remove when the test runner is
// migrated from Jest to Vitest (tracked in TODOs.md).
//
// CACHE TAG: the 'v1' string in getCacheKey below must be bumped any time the
// patchImportMeta() logic changes — otherwise Jest serves stale cached output.
// Alternatively, run `npx jest --clearCache` after editing this file.

const ts = require('typescript');
const crypto = require('crypto');

const TS_CONFIG = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2017,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  skipLibCheck: true,
};

function patchImportMeta(source) {
  // Remove "const require = createRequire(import.meta.url)" declarations.
  // CJS modules already have `require` as a parameter — redeclaring it with
  // `const` is a SyntaxError. The CJS require is semantically equivalent.
  let patched = source.replace(
    /^const require = createRequire\(import\.meta\.url\);?\s*$/gm,
    '',
  );

  // Replace remaining import.meta.url references with the CJS-compatible
  // URL polyfill (createRequire accepts a file:// URL or a file path).
  patched = patched.replace(
    /\bimport\.meta\.url\b/g,
    "require('url').pathToFileURL(__filename).href",
  );

  return patched;
}

function process(sourceText, sourcePath) {
  const patched = patchImportMeta(sourceText);
  const result = ts.transpileModule(patched, {
    compilerOptions: TS_CONFIG,
    fileName: sourcePath,
    reportDiagnostics: false,
  });
  return { code: result.outputText };
}

function getCacheKey(sourceText, sourcePath, options) {
  return crypto
    .createHash('sha256')
    .update(sourceText)
    .update(sourcePath)
    .update(JSON.stringify(options.config ?? {}))
    .update('v1')
    .digest('hex');
}

module.exports = { process, getCacheKey };
