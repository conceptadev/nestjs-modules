# Current scope
  * `@concepta/nestjs-common` is deprecated — reverted to v7 line (`7.0.0-alpha.10`) and excluded from the v8 workspace. Its remaining v8-only symbols were merged into nestjs-core. Run `npm deprecate @concepta/nestjs-common@8.0.0-alpha.6` at publish time.
  * Non-v8 packages are excluded from the Yarn workspace (see `workspaces` in root `package.json`) until they are migrated to the DDD pattern and NestJS 12: nestjs-email, nestjs-event, nestjs-logger, nestjs-auth-github, nestjs-org, nestjs-swagger-ui, nestjs-auth-google, nestjs-logger-coralogix, nestjs-logger-sentry, nestjs-file, nestjs-auth-apple, nestjs-report, nestjs-samples. Also removed `@concepta/nestjs-email` from devDependencies in nestjs-invitation and nestjs-authentication (only used in e2e tests — restore when nestjs-email is migrated).

# Critical
  * need to implement optimistic locking in the base repo adapter

# High
  * need a system wide scan for direct settings injection. no options/settings should escape the module definitions.
  * Domain services should generate their own event contexts
  * Remove old resource types as we refactor

# High — NestJS 12 upgrade cleanup (temporary shims to remove)

  * **When NestJS 12 GA ships**: Replace all `12.0.0-alpha.*` / `12.0.0-next.*` pins in every package.json with `^12.0.0` semver ranges, then run `yarn test` + `yarn test:e2e`. Also audit ~10 source files importing the internal path `@nestjs/common/utils/shared.utils` — resolves today via v12's wildcard `./*` export but is an undocumented internal that could be removed at GA; migrate each import to a public equivalent (e.g. `isObject` → a local utility or `class-transformer`). Files: nestjs-core `exceptions.filter.ts`, nestjs-crud (5 files: adapter, serialize-interceptor, validation, query-builder, query-parser, scondition-converter), nestjs-repository `repository-adapter.ts`.

  * **When non-v8 packages are migrated to NestJS 12**: Full restore checklist — per package:
    1. Root `package.json` `workspaces` array — add dir (or revert to glob `packages/*` when all are migrated)
    2. Root `package.json` `build:cjs` script — the CJS build lists dirs explicitly; add the new package's path
    3. `tsconfig.json` `references` — add `{ "path": "packages/<pkg>" }`
    4. `tsconfig.esm.json` `references` — add `{ "path": "packages/<pkg>/tsconfig.esm.json" }` (ESM build is solution-file-driven; missing this silently skips the ESM build)
    5. `vitest.config.ts` `test.include` — add `"packages/<pkg>/**/*.spec.ts"`
    6. `vitest.config-e2e.ts` `test.include` — add `"packages/<pkg>/**/*.e2e-spec.ts"`
    7. Restore `@concepta/nestjs-email` to nestjs-authentication and nestjs-invitation devDependencies once nestjs-email is migrated.
    Note: `scripts/add-esm-extensions.cjs` and `scripts/inject-pkg-type.cjs` auto-discover all `packages/*` dirs and need no changes.

  * **When `@nestjs/cqrs` v12 ships**: Remove the `packageExtensions` block from `.yarnrc.yml` and move cqrs from `dependencies` to `peerDependencies` in these packages: nestjs-access-control, nestjs-authentication, nestjs-cache, nestjs-federated, nestjs-invitation, nestjs-otp, nestjs-password, nestjs-role, nestjs-user.

  * **Before stable release — do all three together as one GA pass**:
    - Replace all `12.0.0-alpha.*` / `12.0.0-next.*` pins with `^12.0.0` ranges (see re-pin bullet above).
    - Move `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/swagger` from `dependencies` to `peerDependencies` (+ `devDependencies`) in all 13 v8 packages. Currently exact-pinned deps; a consumer on a different NestJS 12 patch gets a second copy, splitting the decorator metadata registry.
    - Audit the ~10 `@nestjs/common/utils/shared.utils` internal imports (see re-pin bullet above for file list).

# Nice To Have
  * Optional exports patterns are different across the modules

Tutorial Topics

* Support of the minimum interface
* Provider Overrides
