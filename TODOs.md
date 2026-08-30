# Current scope
  * `@concepta/nestjs-common` is deprecated — reverted to v7 line (`7.0.0-alpha.10`) and excluded from the v8 workspace. Its remaining v8-only symbols were merged into nestjs-core. Run `npm deprecate @concepta/nestjs-common@8.0.0-alpha.6` at publish time.
  * Non-v8 packages are excluded from the Yarn workspace (see `workspaces` in root `package.json`) until they are migrated to the DDD pattern and NestJS 12: nestjs-email, nestjs-event, nestjs-logger, nestjs-auth-github, nestjs-org, nestjs-swagger-ui, nestjs-auth-google, nestjs-logger-coralogix, nestjs-logger-sentry, nestjs-file, nestjs-auth-apple, nestjs-report, nestjs-samples. Also removed `@concepta/nestjs-email` from devDependencies in nestjs-invitation and nestjs-authentication (only used in e2e tests — restore when nestjs-email is migrated).

# Ranked backlog

Single priority order across everything below (Fable review, 2026-08-30), ranked by
(impact of leaving it undone) vs (effort × blast radius) — not grouped by the old
Critical/High/Nice-To-Have labels, which were rough guesses and sometimes wrong (see
#2, promoted out of what used to be "Nice To Have"). Effort tags: S/M/L. Completed items
are removed from this list rather than marked done — see git history for what shipped
(the `peerDependencies` restructuring for `@nestjs/common`/`core`/`config`/`swagger` and
`@nestjs/cqrs` across all 13 v8 packages, plus the `.yarnrc.yml` cleanup it unblocked).

  1. **[L] Optimistic locking in the base repo adapter** — `@VersionColumn` exists on the
     audit entities (`nestjs-repository-typeorm/src/entities/audit/audit-{postgres,sqlite}.entity.ts:41`)
     but neither `typeorm-repository.ts` (plain `repo.save()` on update/replace) nor the
     repository adapter checks it before saving — silent lost-update bug today. Real
     production data-loss class of bug for a published library; effort doesn't demote it.

  2. **[S] `CrudQueryBuilder.paramNamesMap` has no `join` entry** — confirmed shipping bug,
     not cosmetic: every generated `@CrudList`/`@CrudRead` route emits an unnamed OpenAPI
     parameter (`crud-query.builder.ts:43-54`), currently masked by filtering falsy names
     out of both sides of the assertion in `crud-query-params-api.decorator.spec.ts`.
     Small, TDD-friendly fix — un-filter the spec assertion first (red), then add the
     `join` key.

  3. **[S/M] Audit the `@nestjs/common/utils/shared.utils` imports** — 9 v8 files import
     this undocumented internal path. It resolves today via v12's wildcard `./*` export
     but could disappear in any minor. Migrate each to a public equivalent or a local
     utility. nestjs-crud (8): `interceptors/crud-serialize.interceptor.ts`,
     `utils/validation.ts`, `utils/crud-empty-body-guard.util.ts`,
     `adapters/crud.adapter.ts`, `request/crud-scondition.converter.ts`,
     `request/crud-query.builder.ts`, `request/crud-query.parser.ts`,
     `request/crud-query.validator.ts`. nestjs-repository (1):
     `repository/repository-adapter.ts`. (`nestjs-common/src/filters/exceptions.filter.ts`
     also matches — deprecated package, out of the v8 workspace, ignore.)

  4. **[S/M] System-wide scan for direct settings injection** — smaller than the original
     note implied: exactly 7 sites inject the raw `*_SETTINGS_TOKEN` into a handler instead
     of the module definition providing narrowed values — nestjs-otp (5: 4 command/query
     handlers + 1 listener), nestjs-access-control (2: handlers). No options/settings
     should escape the module definitions this way. Architectural hygiene, nothing
     currently broken by it.

  5. **[S] `roleCreateSchema`/`roleUpdateSchema` allow empty `name`/`description` via
     `.default('')`** — a faithful reproduction of the v7 class defaults, but it means
     empty-named roles validate successfully today. 3 fixtures/specs currently assert on
     `name: ''` and will need updating in the same change if `name` becomes required.

  6. **[M] Per-operation `api.body` options silently dropped** — `ApiBodyOptions`
     overrides (description, examples, `required`) are lost for schema-based request
     bodies; needs metadata plumbing to carry the options alongside the per-operation
     schema into `CrudInitApiBody` (root cause documented in the migration plan's
     post-Phase-4 audit). Docs-only degradation, not a runtime bug.

  7. **[M/L — needs design first] Domain services should generate their own event
     contexts** — 32 call sites across 7 packages currently pass
     `new EventContextHost({}, {})` (empty). What the real context should be derived
     from isn't decided — user confirmed this needs a design pass (not sure yet whether
     it's the active transaction, request context, or something else) before it's
     actionable. Don't pick this up as a quick win; scope a design session first.

  8. **[S] Add an ESLint `import/extensions` rule** — belt-and-suspenders guard for the
     `nodenext` `.js`-extension requirement on relative imports (`eslint-plugin-import`
     is already a configured dependency, no conflicting rule exists). Not essential —
     `tsc` itself already makes a missing extension a hard `TS2835` compile error. Do
     opportunistically.

  9. **[needs research first] Optional exports patterns are different across the
     modules** — user confirmed no canonical pattern has been chosen yet; needs research
     into the existing per-module variations before a target shape can even be proposed.
     Not a quick win.

  10. **Tutorial Topics** — Support of the minimum interface; Provider Overrides. Docs
      work; sequence after the API stabilizes, especially after #1 lands.

  11. **When non-v8 packages are migrated to NestJS 12** — not actionable until triggered.
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
