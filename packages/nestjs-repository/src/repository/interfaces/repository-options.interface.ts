import { PlainLiteralObject } from '@nestjs/common';

import { OrderClause } from '../repository.types';

import { JoinClause } from './join-clause.interface';
import { WhereClause } from './where-clause.interface';

/**
 * Base options with optional context.
 */
export interface RepositoryBaseOptions {
  ctx?: PlainLiteralObject;
}

/**
 * Options for finding a single entity.
 */
export interface RepositoryFindOneOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryBaseOptions {
  select?: (keyof Entity)[];
  where?: WhereClause;
  join?: JoinClause[];
  order?: OrderClause;
  withDeleted?: boolean;
}

/**
 * Options for finding multiple entities.
 */
export interface RepositoryFindOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryFindOneOptions<Entity> {
  skip?: number;
  take?: number;
}

/**
 * Options for create operations.
 */
export interface RepositoryCreateOptions extends RepositoryBaseOptions {}

/**
 * Options for update operations.
 */
export interface RepositoryUpdateOptions extends RepositoryBaseOptions {}

/**
 * Options for upsert operations.
 */
export interface RepositoryUpsertOptions extends RepositoryBaseOptions {}

/**
 * Options for delete operations.
 */
export interface RepositoryDeleteOptions extends RepositoryBaseOptions {}

/**
 * Options for restore operations.
 */
export interface RepositoryRestoreOptions extends RepositoryBaseOptions {}
