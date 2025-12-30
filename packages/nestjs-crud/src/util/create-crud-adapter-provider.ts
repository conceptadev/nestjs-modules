import {
  InjectionToken,
  PlainLiteralObject,
  Provider,
  Type,
} from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { CrudAdapter } from '../crud/adapters/crud.adapter';

import { getDynamicCrudAdapterToken } from './inject-dynamic-crud-adapter.decorator';

/**
 * Configuration for creating a CRUD adapter provider
 */
interface CreateCrudAdapterProviderConfig<Entity extends PlainLiteralObject> {
  /**
   * The entity key used to identify the repository
   * (e.g., 'USER_MODULE_USER_ENTITY_KEY')
   */
  entityKey: string;

  /**
   * The CRUD adapter class to instantiate
   * (e.g., TypeOrmCrudAdapter)
   */
  adapter: Type<CrudAdapter<Entity>>;

  /**
   * Optional custom injection token
   * If not provided, uses getDynamicCrudAdapterToken(entityKey)
   */
  injectionToken?: InjectionToken<CrudAdapter<Entity>>;
}

/**
 * Creates a NestJS provider for a CRUD adapter
 *
 * This factory eliminates boilerplate adapter class files by dynamically
 * creating adapter instances from repository adapters.
 *
 * @example
 * ```typescript
 * const UserCrudAdapterProvider = createCrudAdapterProvider({
 *   entityKey: USER_MODULE_USER_ENTITY_KEY,
 *   adapter: TypeOrmCrudAdapter,
 * });
 *
 * @Module({
 *   providers: [UserCrudAdapterProvider],
 * })
 * export class UserModule {}
 * ```
 *
 * @param config - Configuration for the CRUD adapter provider
 * @returns A NestJS provider that creates the adapter instance
 */
export function createCrudAdapterProvider<Entity extends PlainLiteralObject>(
  config: CreateCrudAdapterProviderConfig<Entity>,
): Provider {
  const { entityKey, adapter, injectionToken } = config;

  return {
    provide: injectionToken ?? getDynamicCrudAdapterToken(entityKey),
    inject: [getDynamicRepositoryToken(entityKey)],
    useFactory: (repository: RepositoryInterface<Entity>) => {
      return new adapter(repository);
    },
  };
}
