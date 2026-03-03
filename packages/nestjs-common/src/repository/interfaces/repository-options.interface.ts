import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryContextInterface } from '../../context/interfaces/repository-context.interface';
import { SortOrder } from '../repository.types';

import { JoinClause } from './join-clause.interface';
import { WhereClause } from './where-clause.interface';

/**
 * Base options with optional context.
 */
export interface RepositoryBaseOptions<
  Ctx extends RepositoryContextInterface = RepositoryContextInterface,
> {
  ctx?: Ctx;
}

/**
 * Order options keyed by entity field.
 * Supports nested ordering for relations (e.g., `{ blog: { status: 'ASC' } }`).
 *
 * Uses a string index signature because sort fields arrive as parsed strings
 * from query parameters and may include relation keys that are not on the entity type.
 */
export interface RepositoryOrderOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  [K: string]: SortOrder | RepositoryOrderOptions<Entity>;
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
  order?: RepositoryOrderOptions<Entity>;
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
