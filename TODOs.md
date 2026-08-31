# Current scope
  * `@concepta/nestjs-common` is deprecated — reverted to v7 line (`7.0.0-alpha.10`) and excluded from the v8 workspace. Its remaining v8-only symbols were merged into nestjs-core. Run `npm deprecate @concepta/nestjs-common@8.0.0-alpha.6` at publish time.
  * Non-v8 packages are excluded from the Yarn workspace (see `workspaces` in root `package.json`) until they are migrated to the DDD pattern and NestJS 12: nestjs-email, nestjs-event, nestjs-logger, nestjs-auth-github, nestjs-org, nestjs-swagger-ui, nestjs-auth-google, nestjs-logger-coralogix, nestjs-logger-sentry, nestjs-file, nestjs-auth-apple, nestjs-report, nestjs-samples. Also removed `@concepta/nestjs-email` from devDependencies in nestjs-invitation and nestjs-authentication (only used in e2e tests — restore when nestjs-email is migrated).

# Ranked backlog

Single priority order across everything below (Fable review, 2026-08-30), ranked by
(impact of leaving it undone) vs (effort × blast radius) — not grouped by the old
Critical/High/Nice-To-Have labels, which were rough guesses and sometimes wrong. Effort
tags: S/M/L. Completed items are removed from this list rather than marked done — see
git history for what shipped.

  1. **[S] `roleCreateSchema`/`roleUpdateSchema` allow empty `name`/`description` via
     `.default('')`** — a faithful reproduction of the v7 class defaults, but it means
     empty-named roles validate successfully today. 3 fixtures/specs currently assert on
     `name: ''` and will need updating in the same change if `name` becomes required.

  2. **[M] Per-operation `api.body` options silently dropped** — `ApiBodyOptions`
     overrides (description, examples, `required`) are lost for schema-based request
     bodies; needs metadata plumbing to carry the options alongside the per-operation
     schema into `CrudInitApiBody` (root cause documented in the migration plan's
     post-Phase-4 audit). Docs-only degradation, not a runtime bug.

  3. **[M/L — needs design first] Domain services should generate their own event
     contexts** — 32 call sites across 7 packages currently pass
     `new EventContextHost({}, {})` (empty). What the real context should be derived
     from isn't decided — user confirmed this needs a design pass (not sure yet whether
     it's the active transaction, request context, or something else) before it's
     actionable. Don't pick this up as a quick win; scope a design session first.

  4. **[S] Add an ESLint `import/extensions` rule** — belt-and-suspenders guard for the
     `nodenext` `.js`-extension requirement on relative imports (`eslint-plugin-import`
     is already a configured dependency, no conflicting rule exists). Not essential —
     `tsc` itself already makes a missing extension a hard `TS2835` compile error. Do
     opportunistically.

  5. **[needs research first] Optional exports patterns are different across the
      modules** — user confirmed no canonical pattern has been chosen yet; needs research
      into the existing per-module variations before a target shape can even be proposed.
      Not a quick win.

  6. **Tutorial Topics** — Support of the minimum interface; Provider Overrides. Docs
      work; sequence after the API stabilizes.

  7. **When non-v8 packages are migrated to NestJS 12** — not actionable until triggered.
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
