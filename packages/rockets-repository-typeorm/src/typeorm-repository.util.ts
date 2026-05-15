import { DataSource, Repository } from 'typeorm';

import { DynamicModule, PlainLiteralObject, Provider } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { HookResolverService } from '@concepta/rockets-app';
import {
  getDynamicRepositoryToken,
  RelationActionConfig,
} from '@concepta/rockets-repository';

import { TypeOrmProviderOptionsInterface } from './repository/typeorm-provider-options.interface';
import { TypeOrmRepository } from './repository/typeorm-repository';
import { TypeOrmTransactionFactory } from './transaction/typeorm-transaction.factory';
import { TYPEORM_DEFAULT_DATA_SOURCE_NAME } from './typeorm-repository.constants';
import { TypeOrmDataSourceToken } from './typeorm-repository.types';

/**
 * Resolve data source name from token.
 */
export function resolveDataSourceName(
  dataSource?: TypeOrmDataSourceToken,
): string {
  if (!dataSource) {
    return TYPEORM_DEFAULT_DATA_SOURCE_NAME;
  }
  return typeof dataSource === 'string'
    ? dataSource
    : (dataSource.name ?? TYPEORM_DEFAULT_DATA_SOURCE_NAME);
}

/**
 * Resolve transaction key for a data source.
 */
export function resolveTransactionKey(
  dataSource?: TypeOrmDataSourceToken,
): string {
  return `typeorm:${resolveDataSourceName(dataSource)}`;
}

/**
 * Resolve TypeORM token name from data source name.
 */
export function resolveTokenName(dsName?: string): string | undefined {
  return dsName === TYPEORM_DEFAULT_DATA_SOURCE_NAME ? undefined : dsName;
}

/**
 * Create a TypeOrmRepository instance.
 */
export function createTypeOrmRepository<E extends PlainLiteralObject>(
  repo: Repository<E>,
  entityKey: string,
  dataSource?: string,
  hookResolver?: HookResolverService,
  relationsConfig?: Record<string, RelationActionConfig>,
): TypeOrmRepository<E> {
  return new TypeOrmRepository(repo, {
    entityKey,
    transactionKey: resolveTransactionKey(dataSource),
    hookResolver,
    relationsConfig,
  });
}

/**
 * Injection token for optional HookResolverService.
 * Using this constant allows NestJS to inject undefined when HookResolverService is not available.
 */
export const OPTIONAL_HOOK_RESOLVER_INJECT = {
  token: HookResolverService,
  optional: true,
};

/**
 * Create a NestJS provider for an entity.
 */
export function createTypeOrmProvider<E extends PlainLiteralObject>(
  options: TypeOrmProviderOptionsInterface<E>,
): Provider {
  const { key, entity, dataSource, factory, relations } = options;
  const dsName = resolveDataSourceName(dataSource);
  const dsToken = resolveTokenName(dsName);

  if (factory) {
    return {
      provide: getDynamicRepositoryToken(key),
      inject: [getDataSourceToken(dsToken), OPTIONAL_HOOK_RESOLVER_INJECT],
      useFactory: (ds: DataSource, hookResolver?: HookResolverService) => {
        return createTypeOrmRepository(
          factory(ds),
          key,
          dsName,
          hookResolver,
          relations,
        );
      },
    };
  } else {
    return {
      provide: getDynamicRepositoryToken(key),
      inject: [
        getRepositoryToken(entity, dsToken),
        OPTIONAL_HOOK_RESOLVER_INJECT,
      ],
      useFactory: (repo: Repository<E>, hookResolver?: HookResolverService) => {
        return createTypeOrmRepository(
          repo,
          key,
          dsName,
          hookResolver,
          relations,
        );
      },
    };
  }
}

/**
 * Get TypeORM module imports for entities.
 */
export function getTypeOrmImports(
  entities: readonly TypeOrmProviderOptionsInterface<PlainLiteralObject>[],
): DynamicModule[] {
  // Group entities by data source for TypeORM imports
  const entitiesByDataSource: Record<string, EntityClassOrSchema[]> = {};

  for (const entityOption of entities) {
    const dsName = resolveDataSourceName(entityOption.dataSource);

    if (!(dsName in entitiesByDataSource)) {
      entitiesByDataSource[dsName] = [];
    }

    entitiesByDataSource[dsName].push(entityOption.entity);
  }

  const imports: DynamicModule[] = [];

  for (const dsName in entitiesByDataSource) {
    imports.push(
      TypeOrmModule.forFeature(
        entitiesByDataSource[dsName],
        resolveTokenName(dsName),
      ),
    );
  }

  return imports;
}

/**
 * Create a transaction factory descriptor for a data source.
 * RepositoryModule handles the actual registration.
 *
 * @param dataSource - Optional data source name
 * @returns Transaction factory descriptor
 */
export function createTransactionFactoryDescriptor(dataSource?: string): {
  key: string;
  inject: ReturnType<typeof getDataSourceToken>[];
  useFactory: (ds: DataSource) => TypeOrmTransactionFactory;
} {
  const dsName = resolveDataSourceName(dataSource);
  const dsToken = resolveTokenName(dsName);

  return {
    key: resolveTransactionKey(dataSource),
    inject: [getDataSourceToken(dsToken)],
    useFactory: (ds: DataSource) => new TypeOrmTransactionFactory(ds),
  };
}
