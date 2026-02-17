import { PlainLiteralObject } from '@nestjs/common';

import { AppContextHost, Operation } from '@concepta/nestjs-common';

import { CrudContextInterface } from '../../crud/interfaces/crud-context.interface';
import { CrudRelationsInterface } from '../../crud/interfaces/crud-relations.interface';
import { operationToAction } from '../../crud/util';
import { QueryRelation } from '../../request/crud-query.types';
import { CrudParsedQueryInterface } from '../../request/interfaces/crud-parsed-query.interface';

// Mock entities
export interface TestRoot extends PlainLiteralObject {
  id: number;
  name: string;
  companyId?: number;
}

export interface TestRelation extends PlainLiteralObject {
  id: number;
  rootId: number;
  title: string;
  priority?: number;
  status?: string;
  isLatest?: boolean;
}

export interface TestProfile extends PlainLiteralObject {
  id: number;
  rootId: number;
  bio: string;
  avatar?: string;
}

export interface TestSettings extends PlainLiteralObject {
  id: number;
  rootId: number;
  theme: string;
  notifications: boolean;
}

// Factory function for creating a default CrudContextInterface
export const createTestContext = <T extends PlainLiteralObject = TestRoot>(
  operation: Operation = Operation.List,
  entity = '',
): CrudContextInterface<T> => {
  return AppContextHost.create<CrudContextInterface<T>>({
    entity,
    params: {},
    query: {
      search: undefined,

      sort: [],
      fields: [],
      limit: undefined,
      offset: undefined,
      page: undefined,
      filter: [],
      or: [],
      cache: undefined,
      includeDeleted: undefined,
    },
    options: {},
    operation,
    action: operationToAction(operation),
    locals: {},
    trx: null,
    hooks: [],
  });
};

// Factory functions for creating test data
export const createTestQuery = (
  overrides: Partial<CrudParsedQueryInterface<TestRoot>> = {},
): CrudParsedQueryInterface<TestRoot> => {
  const baseContext = createTestContext();
  return {
    ...baseContext.query,
    ...overrides,
  };
};

export const createTestRelations = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relations: QueryRelation<TestRoot, any>[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): CrudRelationsInterface<TestRoot, any[]> => ({
  rootKey: 'id',
  relations,
});

// Common relation configurations
export function createOneToManyForwardRelation<
  R extends PlainLiteralObject = PlainLiteralObject,
>(
  property: string,
  entity: string,
  options?: {
    primaryKey?: string;
    foreignKey?: string;
    distinctFilter?: QueryRelation<TestRoot, R>['distinctFilter'];
  },
): QueryRelation<TestRoot, R> {
  return {
    property,
    entity,
    primaryKey: options?.primaryKey || 'id',
    foreignKey: options?.foreignKey || 'rootId',
    cardinality: 'many',
    owner: false,
    distinctFilter: options?.distinctFilter,
  };
}

export function createOneToOneForwardRelation<
  R extends PlainLiteralObject = PlainLiteralObject,
>(
  property: string,
  entity: string,
  primaryKey: string = 'id',
  foreignKey: string = 'rootId',
): QueryRelation<TestRoot, R> {
  return {
    property,
    entity,
    primaryKey,
    foreignKey,
    cardinality: 'one',
    owner: false,
  };
}
