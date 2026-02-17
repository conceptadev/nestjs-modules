import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryContextInterface } from '../../context/interfaces/repository-context.interface';
import { SortOrder } from '../repository.types';

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
 */
export type RepositoryOrderOptions<Entity extends PlainLiteralObject> = Partial<
  Record<keyof Entity, SortOrder>
>;

/**
 * Options for finding a single entity.
 */
export interface RepositoryFindOneOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryBaseOptions {
  select?: (keyof Entity)[];
  where?: WhereClause;
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
