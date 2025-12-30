import { Inject } from '@nestjs/common';

/**
 * Gets the injection token for a dynamic CRUD service
 *
 * @param entityKey - The entity key used to identify the CRUD service
 * @returns The injection token string
 */
export function getDynamicCrudServiceToken(entityKey: string): string {
  return `DYNAMIC_CRUD_SERVICE_TOKEN_${entityKey}`;
}

/**
 * Decorator to inject a dynamic CRUD service by entity key
 *
 * This decorator works with services created by `createCrudServiceProvider`
 * or any service registered with the getDynamicCrudServiceToken pattern.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   constructor(
 *     @InjectDynamicCrudService(USER_MODULE_USER_ENTITY_KEY)
 *     private readonly userService: CrudService<UserEntity>,
 *   ) {}
 * }
 * ```
 *
 * @param entityKey - The entity key used to identify the CRUD service
 * @returns A parameter decorator for dependency injection
 */
export function InjectDynamicCrudService(entityKey: string) {
  return Inject(getDynamicCrudServiceToken(entityKey));
}
