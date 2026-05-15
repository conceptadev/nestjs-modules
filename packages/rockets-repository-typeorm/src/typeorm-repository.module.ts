import { Global, Module, Provider } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  DynamicRepositoryModule,
} from '@concepta/rockets-repository';

import { TypeOrmProviderOptionsInterface } from './repository/typeorm-provider-options.interface';
import {
  createTypeOrmProvider,
  getTypeOrmImports,
  createTransactionFactoryDescriptor,
  resolveDataSourceName,
} from './typeorm-repository.util';

/**
 * TypeORM Repository module providing data access with transaction support.
 *
 * Can be used directly or wrapped by RepositoryModule.
 *
 * @example Direct usage
 * ```typescript
 * @Module({
 *   imports: [
 *     TypeOrmModule.forRoot({ ... }),
 *     TypeOrmRepositoryModule.forFeature([
 *       { key: 'orders', entity: Order },
 *       { key: 'customers', entity: Customer, dataSource: 'secondary' },
 *       { key: 'audit', entity: AuditLog, factory: createAuditRepository },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Via RepositoryModule wrapper
 * ```typescript
 * @Module({
 *   imports: [
 *     TypeOrmModule.forRoot({ ... }),
 *     RepositoryModule.forFeature({
 *       module: TypeOrmRepositoryModule,
 *       entities: [{ key: 'orders', entity: Order }],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class TypeOrmRepositoryModule {
  /**
   * Register repositories for TypeORM entities.
   *
   * @param entities - Entity options
   * @returns Dynamic module with repository providers and transaction factory descriptors
   */
  static forFeature(
    entities: TypeOrmProviderOptionsInterface[],
  ): DynamicRepositoryModule {
    // Get imports
    const imports = getTypeOrmImports(entities);

    // Collect unique data source names for transaction factory descriptors
    const dataSourceNames = new Set<string>();
    for (const entity of entities) {
      dataSourceNames.add(resolveDataSourceName(entity.dataSource));
    }

    // Create providers for entities
    const providers: Provider[] = entities.map((entityOption) =>
      createTypeOrmProvider(entityOption),
    );

    // Export tokens for injection
    const exports = entities.map((entityOption) =>
      getDynamicRepositoryToken(entityOption.key),
    );

    // Create transaction factory descriptors for RepositoryModule to register
    const transactionFactories = Array.from(dataSourceNames).map((dsName) =>
      createTransactionFactoryDescriptor(dsName),
    );

    return {
      module: TypeOrmRepositoryModule,
      imports,
      providers,
      exports,
      transactionFactories,
    };
  }
}
