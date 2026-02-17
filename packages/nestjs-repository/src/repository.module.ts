import { Module, DynamicModule, Provider } from '@nestjs/common';

import { getDynamicRepositoryToken } from '@concepta/nestjs-common';

import { RepositoryFeatureOptions } from './interfaces/repository-feature-options.interface';
import { DynamicRepositoryModule } from './interfaces/repository-module.interface';
import { RepositoryModuleClass } from './repository.module-definition';
import {
  RepositoryRegistryService,
  REPOSITORY_REGISTRY,
} from './services/repository-registry.service';
import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction/transaction-factory-registry';

/**
 * Repository module providing data access abstraction with transaction support.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * @Module({
 *   imports: [
 *     TypeOrmModule.forRoot({ ... }),
 *     RepositoryModule.forRoot({}),
 *     RepositoryModule.forFeature({
 *       module: TypeOrmRepositoryModule,
 *       entities: [
 *         { key: 'orders', entity: Order },
 *         { key: 'customers', entity: Customer },
 *       ],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class RepositoryModule extends RepositoryModuleClass {
  /**
   * Register repositories for entities.
   *
   * Delegates to the repository module's forFeature method.
   *
   * @example
   * ```typescript
   * RepositoryModule.forFeature({
   *   module: TypeOrmRepositoryModule,
   *   entities: [
   *     { key: 'orders', entity: Order },
   *     { key: 'customers', entity: Customer },
   *   ],
   * })
   * ```
   */
  static forFeature(options: RepositoryFeatureOptions): DynamicModule {
    const { module, entities } = options;
    const dynamicModule: DynamicRepositoryModule = module.forFeature(entities);
    const moduleName = module.name;

    const providers: Provider[] = [...(dynamicModule.providers ?? [])];

    // Repository registry registration
    const registrationToken = Symbol(
      `REPOSITORY_REGISTRATION_${moduleName}_${Date.now()}`,
    );

    providers.push({
      provide: registrationToken,
      inject: [{ token: REPOSITORY_REGISTRY, optional: true }],
      useFactory: (registry?: RepositoryRegistryService) => {
        if (registry) {
          for (const entity of entities) {
            registry.register({
              key: entity.key,
              entityName: entity.entity.name,
              moduleName,
            });
          }
        }
        return true;
      },
    });

    // Transaction factory registration
    if (dynamicModule.transactionFactories) {
      for (const descriptor of dynamicModule.transactionFactories) {
        const txToken = Symbol(`TX_FACTORY_${descriptor.key}_${Date.now()}`);
        providers.push({
          provide: txToken,
          inject: [
            { token: TRANSACTION_FACTORY_REGISTRY, optional: true },
            ...descriptor.inject,
          ],
          useFactory: (
            registry: TransactionFactoryRegistry | undefined,
            ...args: unknown[]
          ) => {
            if (registry) {
              const factory = descriptor.useFactory(...args);
              registry.register(descriptor.key, factory);
            }
            return null;
          },
        });
      }
    }

    // Export public tokens (providers now use getDynamicRepositoryToken directly)
    const exports = entities.map((entity) =>
      getDynamicRepositoryToken(entity.key),
    );

    return {
      ...dynamicModule,
      providers,
      exports,
    };
  }
}
