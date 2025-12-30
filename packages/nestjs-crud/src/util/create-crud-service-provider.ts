import {
  InjectionToken,
  PlainLiteralObject,
  Provider,
  Type,
} from '@nestjs/common';

import { CrudAdapter } from '../crud/adapters/crud.adapter';
import { CrudService } from '../services/crud.service';

import { getDynamicCrudAdapterToken } from './inject-dynamic-crud-adapter.decorator';
import { getDynamicCrudServiceToken } from './inject-dynamic-crud-service.decorator';

/**
 * Base configuration shared by all variants
 */
interface CreateCrudServiceProviderBaseConfig<
  Entity extends PlainLiteralObject,
> {
  entityKey?: string;
  injectionToken?: InjectionToken<CrudService<Entity>>;
}

/**
 * Configuration with adapter - generates service from adapter
 */
interface CreateCrudServiceProviderWithAdapterConfig<
  Entity extends PlainLiteralObject,
> extends CreateCrudServiceProviderBaseConfig<Entity> {
  useClass?: never;
}

/**
 * Configuration with useClass - uses provided service class directly
 */
interface CreateCrudServiceProviderWithClassConfig<
  Entity extends PlainLiteralObject,
> extends CreateCrudServiceProviderBaseConfig<Entity> {
  useClass: Type<CrudService<Entity>>;
}

/**
 * Configuration for creating a CRUD service provider
 */
type CreateCrudServiceProviderConfig<Entity extends PlainLiteralObject> =
  | CreateCrudServiceProviderWithAdapterConfig<Entity>
  | CreateCrudServiceProviderWithClassConfig<Entity>;

/**
 * Creates a NestJS provider for a CRUD service
 *
 * This factory eliminates boilerplate service class files by dynamically
 * creating service instances from adapters.
 *
 * @example
 * ```typescript
 * const UserCrudServiceProvider = createCrudServiceProvider({
 *   entityKey: 'user',
 *   injectionToken: 'UserCrudService',
 * });
 *
 * @Module({
 *   providers: [UserCrudServiceProvider],
 * })
 * export class UserModule {}
 * ```
 *
 * @param config - Configuration for the CRUD service provider
 * @returns A NestJS provider that creates the service instance
 */
export function createCrudServiceProvider<Entity extends PlainLiteralObject>(
  config: CreateCrudServiceProviderConfig<Entity>,
): Provider {
  const { entityKey, injectionToken, useClass } = config;

  // Determine the provider token
  const serviceToken =
    injectionToken ??
    (entityKey ? getDynamicCrudServiceToken(entityKey) : CrudService);

  // Use class directly if provided
  if (useClass) {
    return {
      provide: serviceToken,
      useClass,
    };
  }

  // Generate service from adapter
  return {
    provide: serviceToken,
    inject: [getDynamicCrudAdapterToken(entityKey!)],
    useFactory: (adapter: CrudAdapter<Entity>) => {
      return new CrudService<Entity>(adapter);
    },
  };
}
