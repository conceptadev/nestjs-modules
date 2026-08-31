# Current scope
  * `@concepta/nestjs-common` is deprecated — reverted to v7 line (`7.0.0-alpha.10`) and excluded from the v8 workspace. Its remaining v8-only symbols were merged into nestjs-core. Run `npm deprecate @concepta/nestjs-common@8.0.0-alpha.6` at publish time.
  * Non-v8 packages are excluded from the Yarn workspace (see `workspaces` in root `package.json`) until they are migrated to the DDD pattern and NestJS 12: nestjs-email, nestjs-event, nestjs-logger, nestjs-auth-github, nestjs-org, nestjs-swagger-ui, nestjs-auth-google, nestjs-logger-coralogix, nestjs-logger-sentry, nestjs-file, nestjs-auth-apple, nestjs-report, nestjs-samples. Also removed `@concepta/nestjs-email` from devDependencies in nestjs-invitation and nestjs-authentication (only used in e2e tests — restore when nestjs-email is migrated).

# Ranked backlog

Single priority order across everything below (Fable review, 2026-08-30), ranked by
(impact of leaving it undone) vs (effort × blast radius) — not grouped by the old
Critical/High/Nice-To-Have labels, which were rough guesses and sometimes wrong. Effort
tags: S/M/L. Completed items are removed from this list rather than marked done — see
git history for what shipped: the `peerDependencies` restructuring for
`@nestjs/common`/`core`/`config`/`swagger` and `@nestjs/cqrs` across all 13 v8 packages
(plus the `.yarnrc.yml` cleanup it unblocked), the `Swagger.createQueryParamsMeta`
`join`-parameter removal (turned out to be a phantom OpenAPI parameter — `join` isn't a
real query-string capability at all, relations are configured server-side via
`@CrudJoin()` — so the fix removed the undocumented-because-broken parameter rather than
just naming it), optimistic locking in `TypeOrmRepository` (`OptimisticLockException`,
409, on a stale `update`/`replace` — see `nestjs-repository-typeorm/README.md`'s
"Optimistic Locking" section for the full mechanism), and the
`@nestjs/common/utils/shared.utils` deep-import migration (the 9 v8 files that used it now
import `isNil`/`isNumber`/`isObject`/`isString`/`isUndefined` from
`@concepta/nestjs-core`'s new `infrastructure/utils/type-guards.util.ts`; a dedicated spec
compares every guard against the original Nest internal across a battery of values so any
future behavioral drift between the two fails loudly instead of silently).

  1. **[S/M] System-wide scan for direct settings injection** — smaller than the original
     note implied: exactly 7 sites inject the raw `*_SETTINGS_TOKEN` into a handler instead
     of the module definition providing narrowed values — nestjs-otp (5: 4 command/query
     handlers + 1 listener), nestjs-access-control (2: handlers). No options/settings
     should escape the module definitions this way. Architectural hygiene, nothing
     currently broken by it.

  2. **[M] Audit hook/interceptor error-swallowing boundaries** — user has had prior
     negative feedback specifically about this. The optimistic-locking work fixed one
     instance: `RepoPermeatorFactory`'s `onError`
     (`nestjs-repository/src/hooks/repo-permeator-factory.ts`) used to only pass through
     `RepositoryQueryException` unchanged, silently swallowing/rewrapping any other thrown
     exception (including well-formed `RuntimeException` subclasses) into a generic
     `RepositoryQueryException` — losing status code, error code, and `instanceof`
     identity. Widened to `instanceof RuntimeException` (verified non-breaking — the
     existing "throws RepositoryQueryException on error" tests throw plain `Error`s, not
     `RuntimeException`s). That fix is narrow — there's at least one more instance of the
     same pattern already in the repo:
     `CrudContextOverlay.buildContext()`'s catch block
     (`nestjs-crud/src/infrastructure/interceptors/crud-context.overlay.ts:102-110`)
     always wraps into `CrudContextException`, preserving `httpStatus` when the original
     error was a `RuntimeException` but still discarding `errorCode`/`context`/`instanceof`
     unconditionally. Do a proper grep pass across the hook/interceptor layers for the same
     "catch error → wrap into a generic exception" shape and establish one consistent
     policy: if the caught error is already a `RuntimeException` subclass, rethrow it
     unchanged; only wrap genuinely opaque/unexpected errors.

  3. **[S] `roleCreateSchema`/`roleUpdateSchema` allow empty `name`/`description` via
     `.default('')`** — a faithful reproduction of the v7 class defaults, but it means
     empty-named roles validate successfully today. 3 fixtures/specs currently assert on
     `name: ''` and will need updating in the same change if `name` becomes required.

  4. **[M] Per-operation `api.body` options silently dropped** — `ApiBodyOptions`
     overrides (description, examples, `required`) are lost for schema-based request
     bodies; needs metadata plumbing to carry the options alongside the per-operation
     schema into `CrudInitApiBody` (root cause documented in the migration plan's
     post-Phase-4 audit). Docs-only degradation, not a runtime bug.

  5. **[M/L — needs design first] Domain services should generate their own event
     contexts** — 32 call sites across 7 packages currently pass
     `new EventContextHost({}, {})` (empty). What the real context should be derived
     from isn't decided — user confirmed this needs a design pass (not sure yet whether
     it's the active transaction, request context, or something else) before it's
     actionable. Don't pick this up as a quick win; scope a design session first.

  6. **[S] Add an ESLint `import/extensions` rule** — belt-and-suspenders guard for the
     `nodenext` `.js`-extension requirement on relative imports (`eslint-plugin-import`
     is already a configured dependency, no conflicting rule exists). Not essential —
     `tsc` itself already makes a missing extension a hard `TS2835` compile error. Do
     opportunistically.

  7. **[needs research first] Optional exports patterns are different across the
     modules** — user confirmed no canonical pattern has been chosen yet; needs research
     into the existing per-module variations before a target shape can even be proposed.
     Not a quick win.

  8. **Tutorial Topics** — Support of the minimum interface; Provider Overrides. Docs
     work; sequence after the API stabilizes.

  9. **When non-v8 packages are migrated to NestJS 12** — not actionable until triggered.
      Full restore checklist per package:
      1. Root `package.json` `workspaces` array — add dir (or revert to glob `packages/*`
         when all are migrated)
      2. Root `tsconfig.json` `references` — add `{ "path": "packages/<pkg>" }` (this
         alone drives both the `tsc -b` ESM build and the type-check gate — the build is
         solution-file-driven)
      3. `vitest.config.ts` `test.include` — add `"packages/<pkg>/**/*.spec.ts"`
      4. `vitest.config-e2e.ts` `test.include` — add `"packages/<pkg>/**/*.e2e-spec.ts"`
      5. Restore `@concepta/nestjs-email` to nestjs-authentication and nestjs-invitation
         devDependencies once nestjs-email is migrated.
