import { DataSource, Repository } from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryProviderOptions } from '@concepta/rockets-repository';

import { TypeOrmDataSourceToken } from '../typeorm-repository.types';

/**
 * TypeORM-specific provider options.
 */
export interface TypeOrmProviderOptionsInterface<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryProviderOptions<Entity> {
  /**
   * Data source name or instance for multi-connection setups.
   */
  dataSource?: TypeOrmDataSourceToken;

  /**
   * Custom repository factory.
   * Receives DataSource, returns Repository instance.
   */
  factory?: (dataSource: DataSource) => Repository<Entity>;
}
