import { Inject } from '@nestjs/common';

/**
 * Gets the injection token for a dynamic CRUD adapter
 *
 * @param entityKey - The entity key used to identify the CRUD adapter
 * @returns The injection token string
 */
export function getDynamicCrudAdapterToken(entityKey: string): string {
  return `DYNAMIC_CRUD_ADAPTER_TOKEN_${entityKey}`;
}

/**
 * Decorator to inject a dynamic CRUD adapter by entity key
 *
 * This decorator works with adapters created by `createCrudAdapterProvider`
 * or any adapter registered with the `getDynamicCrudAdapterToken(entityKey)` pattern.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserCrudService extends CrudService<UserEntity> {
 *   constructor(
 *     @InjectDynamicCrudAdapter(USER_MODULE_USER_ENTITY_KEY)
 *     protected readonly crudAdapter: CrudAdapter<UserEntity>,
 *   ) {
 *     super(crudAdapter);
 *   }
 * }
 * ```
 *
 * @param entityKey - The entity key used to identify the CRUD adapter
 * @returns A parameter decorator for dependency injection
 */
export function InjectDynamicCrudAdapter(entityKey: string) {
  return Inject(getDynamicCrudAdapterToken(entityKey));
}
