import { Module } from '@nestjs/common';

import { HookModuleClass } from './hook.module-definition';

/**
 * Hook module providing specification-based hooks for NestJS applications.
 *
 * This module:
 * - Registers the HookInterceptor globally to gather hooks from `@UseHooks`
 * - Provides HookResolverService for resolving hook instances
 *
 * Hook classes should be registered as providers in your application modules.
 * Use `@UseHooks` decorator on controllers/methods to specify which hooks apply.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * @Module({
 *   imports: [HookModule.forRoot({})],
 *   providers: [TenantHook, AuditHook],
 * })
 * export class AppModule {}
 *
 * // photo.controller.ts
 * @UseHooks(TenantHook, { hook: AuditHook, spec: Spec.isMutation() })
 * @Controller('photos')
 * export class PhotoController { ... }
 *
 * // tenant.hook.ts
 * @Hook()
 * export class TenantHook {
 *   @BeforeFind()
 *   addTenantFilter(options, ctx) {
 *     return { ...options, where: { ...options.where, tenantId: ctx.tenantId } };
 *   }
 * }
 * ```
 */
@Module({})
export class HookModule extends HookModuleClass {}
