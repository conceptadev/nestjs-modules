import { PlainLiteralObject } from '@nestjs/common';

import {
  ActionEnum,
  RepositoryContextInterface,
  Operation,
} from '@concepta/nestjs-common';

import { CrudParsedQueryInterface } from '../../request/interfaces/crud-parsed-query.interface';

import { CrudContextOptionsInterface } from './crud-context-options.interface';

export interface CrudContextInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryContextInterface {
  /**
   * Route parameter values from URL path (e.g., `\{ id: 5, userId: 'abc' \}`).
   * Simple key-value object, not WhereCondition[].
   */
  params: Record<string, unknown>;
  /**
   * Parsed query string parameters (filter, sort, pagination, etc.).
   */
  query: CrudParsedQueryInterface<T>;
  /**
   * Options for the current request including query and route configuration.
   */
  options: CrudContextOptionsInterface<T>;
  /**
   * The CRUD operation being performed (List, Read, Create, etc.).
   */
  operation: Operation;
  /**
   * The action category (CREATE, READ, UPDATE, DELETE).
   */
  action: ActionEnum;
  /**
   * Data populated by CrudLocal resolvers before controller method execution.
   * Keys are the static KEY values from CrudLocal classes.
   * Values are the resolved data from each resolver.
   */
  locals: Record<string, unknown>;
}
