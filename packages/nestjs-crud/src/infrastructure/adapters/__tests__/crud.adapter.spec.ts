import { BadRequestException } from '@nestjs/common';

import { SortOrder, Where, WhereOperator } from '@concepta/nestjs-common';
import { createMockRepository } from '@concepta/nestjs-common/testing';

import { TestCrudAdapter } from '../../../__fixtures__/crud/adapters/test-crud.adapter';
import { mockCrudContext } from '../../../__fixtures__/crud/mocks/crud-context.mock';
import { mockCrudParsedQuery } from '../../../__fixtures__/crud/mocks/crud-parsed-query.mock';
import { CrudContextOptionsInterface } from '../../interceptors/interfaces/crud-context-options.interface';

interface TestEntity {
  id: string;
  name: string;
  age: number;
}

class TestEntityClass {
  id!: string;
  name!: string;
  age!: number;
}

describe('CrudAdapter', () => {
  let adapter: TestCrudAdapter<TestEntity>;

  beforeAll(() => {
    const repo = createMockRepository<TestEntity>({
      name: 'TestEntity',
      type: TestEntityClass as never,
      columns: [
        { name: 'id', isPrimary: true, isRemoveDate: false },
        { name: 'name', isPrimary: false, isRemoveDate: false },
        { name: 'age', isPrimary: false, isRemoveDate: false },
      ],
    });
    repo.prepare.mockImplementation((dto) => dto as TestEntity);
    adapter = new TestCrudAdapter(repo);
  });

  describe('entityName', () => {
    it('should return repository metadata name', () => {
      expect(adapter.entityName()).toEqual('TestEntity');
    });
  });

  describe('entityType', () => {
    it('should return repository metadata type', () => {
      expect(adapter.entityType()).toEqual(TestEntityClass);
    });
  });

  describe('createPageInfo', () => {
    it('should calculate page and pageCount from limit and offset', () => {
      const result = adapter.createPageInfo([], 100, 10, 10);
      expect(result).toEqual({
        data: [],
        limit: 10,
        count: 0,
        total: 100,
        page: 2,
        pageCount: 10,
      });
    });

    it('should default limit to 1 and total to 0 when undefined', () => {
      const result = adapter.createPageInfo(
        [],
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        data: [],
        limit: 1,
        count: 0,
        total: 0,
        page: 1,
        pageCount: 1,
      });
    });

    it('should report count as data array length', () => {
      const data = [{ id: '1' }, { id: '2' }] as TestEntity[];
      const result = adapter.createPageInfo(data, 50, 10, 0);
      expect(result.count).toEqual(2);
      expect(result.data).toEqual(data);
    });

    it('should calculate page 1 when offset is 0', () => {
      const result = adapter.createPageInfo([], 50, 10, 0);
      expect(result.page).toEqual(1);
    });

    it('should report pageCount 1 when total is falsy', () => {
      expect(adapter.createPageInfo([], 0, 10, 0).pageCount).toEqual(1);
      expect(adapter.createPageInfo([], undefined, 10, 0).pageCount).toEqual(1);
    });
  });

  describe('getTake', () => {
    it('should return query.limit when no maxLimit', () => {
      expect(adapter.getTake(mockCrudParsedQuery({ limit: 25 }), {})).toEqual(
        25,
      );
    });

    it('should cap query.limit to maxLimit', () => {
      expect(
        adapter.getTake(mockCrudParsedQuery({ limit: 100 }), { maxLimit: 50 }),
      ).toEqual(50);
    });

    it('should return query.limit when under maxLimit', () => {
      expect(
        adapter.getTake(mockCrudParsedQuery({ limit: 10 }), { maxLimit: 50 }),
      ).toEqual(10);
    });

    it('should fall back to options.limit when no query.limit', () => {
      expect(adapter.getTake(mockCrudParsedQuery(), { limit: 20 })).toEqual(20);
    });

    it('should cap options.limit to maxLimit', () => {
      expect(
        adapter.getTake(mockCrudParsedQuery(), { limit: 100, maxLimit: 50 }),
      ).toEqual(50);
    });

    it('should return options.limit when under maxLimit', () => {
      expect(
        adapter.getTake(mockCrudParsedQuery(), { limit: 10, maxLimit: 50 }),
      ).toEqual(10);
    });

    it('should return maxLimit when no query.limit and no options.limit', () => {
      expect(adapter.getTake(mockCrudParsedQuery(), { maxLimit: 50 })).toEqual(
        50,
      );
    });

    it('should return null when no limits set', () => {
      expect(adapter.getTake(mockCrudParsedQuery(), {})).toBeNull();
    });
  });

  describe('getSkip', () => {
    it('should calculate skip from page and take', () => {
      expect(adapter.getSkip(mockCrudParsedQuery({ page: 3 }), 10)).toEqual(20);
    });

    it('should return offset when no page', () => {
      expect(adapter.getSkip(mockCrudParsedQuery({ offset: 15 }), 10)).toEqual(
        15,
      );
    });

    it('should return null when no page and no offset', () => {
      expect(adapter.getSkip(mockCrudParsedQuery(), 10)).toBeNull();
    });

    it('should return null when page is set but take is null', () => {
      expect(
        adapter.getSkip(mockCrudParsedQuery({ page: 2 }), null),
      ).toBeNull();
    });
  });

  describe('getPrimaryParams', () => {
    it('should return primary param fields', () => {
      const options: CrudContextOptionsInterface<TestEntity> = {
        params: {
          id: { field: 'id', type: 'uuid', primary: true },
        },
      };
      expect(adapter.getPrimaryParams(options)).toEqual(['id']);
    });

    it('should exclude non-primary params', () => {
      const options: CrudContextOptionsInterface<TestEntity> = {
        params: {
          id: { field: 'id', type: 'uuid', primary: true },
          name: { field: 'name', type: 'string', primary: false },
        },
      };
      expect(adapter.getPrimaryParams(options)).toEqual(['id']);
    });

    it('should return empty array when no params defined', () => {
      expect(adapter.getPrimaryParams({})).toEqual([]);
    });

    it('should filter out params with undefined field', () => {
      const options: CrudContextOptionsInterface<TestEntity> = {
        params: {
          id: { type: 'uuid', primary: true },
        },
      };
      expect(adapter.getPrimaryParams(options)).toEqual([]);
    });
  });

  describe('getAllowedColumns', () => {
    const allColumns: (keyof TestEntity & string)[] = ['id', 'name', 'age'];

    it('should return all columns when no allow or exclude', () => {
      expect(adapter.getAllowedColumns(allColumns, {})).toEqual(allColumns);
    });

    it('should return all columns when allow and exclude are empty', () => {
      expect(
        adapter.getAllowedColumns(allColumns, { allow: [], exclude: [] }),
      ).toEqual(allColumns);
    });

    it('should filter to only allowed columns', () => {
      expect(
        adapter.getAllowedColumns(allColumns, { allow: ['id', 'name'] }),
      ).toEqual(['id', 'name']);
    });

    it('should remove excluded columns', () => {
      expect(
        adapter.getAllowedColumns(allColumns, { exclude: ['age'] }),
      ).toEqual(['id', 'name']);
    });

    it('should apply both allow and exclude', () => {
      expect(
        adapter.getAllowedColumns(allColumns, {
          allow: ['id', 'name'],
          exclude: ['name'],
        }),
      ).toEqual(['id']);
    });
  });

  describe('checkFilterIsArray', () => {
    it('should return true for non-empty array value', () => {
      const cond = {
        field: 'id' as keyof TestEntity,
        operator: WhereOperator.IN,
        value: ['a', 'b'],
      };
      expect(adapter.checkFilterIsArray(cond)).toEqual(true);
    });

    it('should throw BadRequestException for empty array', () => {
      const cond = {
        field: 'id' as keyof TestEntity,
        operator: WhereOperator.IN,
        value: [],
      };
      expect(() => adapter.checkFilterIsArray(cond)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('prepareEntityBeforeSave', () => {
    it('should return undefined for non-object input', () => {
      const ctx = mockCrudContext();
      expect(
        adapter.prepareEntityBeforeSave(null as never, ctx),
      ).toBeUndefined();
    });

    it('should return undefined for empty object', () => {
      const ctx = mockCrudContext();
      expect(adapter.prepareEntityBeforeSave({} as never, ctx)).toBeUndefined();
    });

    it('should return entity with dto field values', () => {
      const dto = { id: '1', name: 'Test' } as TestEntity;
      const ctx = mockCrudContext();
      const result = adapter.prepareEntityBeforeSave(dto, ctx);
      expect(result).toBeDefined();
      expect(result?.id).toEqual('1');
      expect(result?.name).toEqual('Test');
    });

    it('should apply matching route params to entity', () => {
      const dto = { id: '1', name: 'Test' } as TestEntity;
      const context = mockCrudContext({ params: { id: 'overridden' } });
      const result = adapter.prepareEntityBeforeSave(dto, context);
      expect(result).toBeDefined();
      expect(result?.id).toEqual('overridden');
    });

    it('should ignore route params not present in dto', () => {
      const dto = { name: 'Test' } as TestEntity;
      const context = mockCrudContext({
        params: { id: 'should-not-appear' },
      });
      const result = adapter.prepareEntityBeforeSave(dto, context);
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('id');
      expect(result?.name).toEqual('Test');
    });
  });

  describe('buildWhere', () => {
    it('should return undefined when no conditions exist', () => {
      const ctx = mockCrudContext();
      expect(adapter.exposedBuildWhere(ctx)).toBeUndefined();
    });

    it('should convert single param to eq condition', () => {
      const ctx = mockCrudContext({ params: { id: '5' } });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('id', '5'));
    });

    it('should combine multiple params with and', () => {
      const ctx = mockCrudContext({ params: { id: '1', name: 'test' } });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(
        Where.and(Where.eq('id', '1'), Where.eq('name', 'test')),
      );
    });

    it('should combine params and query.filter with and', () => {
      const ctx = mockCrudContext({
        params: { id: '5' },
        query: mockCrudParsedQuery({
          filter: [{ field: 'name', operator: WhereOperator.EQ, value: 'foo' }],
        }),
      });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(
        Where.and(Where.eq('id', '5'), Where.eq('name', 'foo')),
      );
    });

    describe('options.query.filter', () => {
      it('should convert WhereCondition[] to where conditions', () => {
        const ctx = mockCrudContext({
          options: {
            query: {
              filter: [
                { field: 'name', operator: WhereOperator.EQ, value: 'admin' },
              ],
            },
          },
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.eq('name', 'admin'),
        );
      });

      it('should treat non-array truthy filter as SCondition', () => {
        const ctx = mockCrudContext({
          options: {
            query: {
              filter: { name: { $eq: 'admin' } },
            },
          },
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.eq('name', 'admin'),
        );
      });

      it('should ignore empty WhereCondition[] options filter', () => {
        const ctx = mockCrudContext({
          options: { query: { filter: [] } },
        });
        expect(adapter.exposedBuildWhere(ctx)).toBeUndefined();
      });
    });

    describe('query.search', () => {
      it('should convert query.search SCondition to where', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            search: { name: { $contains: 'foo' } },
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.contains('name', 'foo'),
        );
      });

      it('should use query.search even when filters are present', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            search: { name: { $contains: 'foo' } },
            filter: [{ field: 'id', operator: WhereOperator.EQ, value: 1 }],
          }),
        });
        // search takes precedence, filter is ignored
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.contains('name', 'foo'),
        );
      });
    });

    describe('query.filter', () => {
      it('should convert single filter to where', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            filter: [
              { field: 'name', operator: WhereOperator.EQ, value: 'foo' },
            ],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('name', 'foo'));
      });

      it('should convert multiple filters to and where', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            filter: [
              { field: 'name', operator: WhereOperator.EQ, value: 'foo' },
              { field: 'id', operator: WhereOperator.GT, value: 5 },
            ],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.and(Where.eq('name', 'foo'), Where.gt('id', 5)),
        );
      });
    });

    describe('query.or', () => {
      it('should convert single or to where', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            or: [{ field: 'name', operator: WhereOperator.EQ, value: 'bar' }],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('name', 'bar'));
      });
    });

    describe('filter + or combined', () => {
      it('should create or with single filter and single or', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            filter: [
              { field: 'name', operator: WhereOperator.EQ, value: 'foo' },
            ],
            or: [{ field: 'name', operator: WhereOperator.EQ, value: 'bar' }],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.or(Where.eq('name', 'foo'), Where.eq('name', 'bar')),
        );
      });

      it('should create or with and groups for multiple filters and ors', () => {
        const ctx = mockCrudContext({
          query: mockCrudParsedQuery({
            filter: [
              { field: 'name', operator: WhereOperator.EQ, value: 'foo' },
              { field: 'id', operator: WhereOperator.GT, value: 1 },
            ],
            or: [
              { field: 'name', operator: WhereOperator.EQ, value: 'bar' },
              { field: 'id', operator: WhereOperator.LT, value: 10 },
            ],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.or(
            Where.and(Where.eq('name', 'foo'), Where.gt('id', 1)),
            Where.and(Where.eq('name', 'bar'), Where.lt('id', 10)),
          ),
        );
      });
    });
  });

  describe('buildJoin', () => {
    it('should return undefined when no relations config', () => {
      const ctx = mockCrudContext();
      expect(adapter.exposedBuildJoin(ctx)).toBeUndefined();
    });

    it('should return undefined when relations array is empty', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: {
              rootKey: 'id',
              relations: [] as never,
            },
          },
        },
      });
      expect(adapter.exposedBuildJoin(ctx)).toBeUndefined();
    });

    it('should map relations to JoinClause array', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: {
              rootKey: 'id',
              relations: [
                {
                  property: 'posts',
                  cardinality: 'many',
                  entity: 'PostEntity',
                  join: 'LEFT' as const,
                  primaryKey: 'id',
                  foreignKey: 'authorId',
                },
              ] as never,
            },
          },
        },
      });
      expect(adapter.exposedBuildJoin(ctx)).toEqual([
        {
          relation: 'posts',
          joinType: 'LEFT',
          cardinality: 'many',
        },
      ]);
    });

    it('should map multiple relations', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: {
              rootKey: 'id',
              relations: [
                {
                  property: 'posts',
                  cardinality: 'many',
                  entity: 'PostEntity',
                  join: 'LEFT' as const,
                  primaryKey: 'id',
                  foreignKey: 'authorId',
                },
                {
                  property: 'profile',
                  cardinality: 'one',
                  entity: 'ProfileEntity',
                  join: 'INNER' as const,
                  primaryKey: 'id',
                  foreignKey: 'userId',
                },
              ] as never,
            },
          },
        },
      });
      const result = adapter.exposedBuildJoin(ctx);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { relation: 'posts', joinType: 'LEFT', cardinality: 'many' },
        { relation: 'profile', joinType: 'INNER', cardinality: 'one' },
      ]);
    });

    it('should return explicit join clauses when query.join is provided', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            join: [{ relation: 'comments', joinType: 'LEFT' }],
          },
        },
      });
      expect(adapter.exposedBuildJoin(ctx)).toEqual([
        { relation: 'comments', joinType: 'LEFT' },
      ]);
    });

    it('should prefer explicit join over relations-derived join', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            join: [{ relation: 'tags', joinType: 'INNER' }],
            relations: {
              rootKey: 'id',
              relations: [
                {
                  property: 'posts',
                  cardinality: 'many',
                  entity: 'PostEntity',
                  join: 'LEFT' as const,
                  primaryKey: 'id',
                  foreignKey: 'authorId',
                },
              ] as never,
            },
          },
        },
      });
      const result = adapter.exposedBuildJoin(ctx);
      expect(result).toEqual([{ relation: 'tags', joinType: 'INNER' }]);
    });

    it('should fall back to relations when join is empty array', () => {
      const ctx = mockCrudContext({
        options: {
          query: {
            join: [],
            relations: {
              rootKey: 'id',
              relations: [
                {
                  property: 'posts',
                  cardinality: 'many',
                  entity: 'PostEntity',
                  join: 'LEFT' as const,
                  primaryKey: 'id',
                  foreignKey: 'authorId',
                },
              ] as never,
            },
          },
        },
      });
      expect(adapter.exposedBuildJoin(ctx)).toEqual([
        { relation: 'posts', joinType: 'LEFT', cardinality: 'many' },
      ]);
    });
  });

  describe('buildOrderClause', () => {
    it('should return empty object when no sort', () => {
      expect(
        adapter.exposedBuildOrderClause(mockCrudParsedQuery(), {}),
      ).toEqual({});
    });

    it('should build order from query sort', () => {
      const query = mockCrudParsedQuery({
        sort: [{ field: 'name', order: SortOrder.ASC }],
      });
      expect(adapter.exposedBuildOrderClause(query, {})).toEqual({
        name: SortOrder.ASC,
      });
    });

    it('should build order from options sort when query sort is empty', () => {
      expect(
        adapter.exposedBuildOrderClause(mockCrudParsedQuery(), {
          sort: [{ field: 'name', order: SortOrder.DESC }],
        }),
      ).toEqual({ name: SortOrder.DESC });
    });

    it('should prefer query sort over options sort', () => {
      const query = mockCrudParsedQuery({
        sort: [{ field: 'name', order: SortOrder.ASC }],
      });
      expect(
        adapter.exposedBuildOrderClause(query, {
          sort: [{ field: 'name', order: SortOrder.DESC }],
        }),
      ).toEqual({ name: SortOrder.ASC });
    });

    it('should build nested order for relation sort', () => {
      const query = mockCrudParsedQuery({
        sort: [{ field: 'name', order: SortOrder.ASC, relation: 'blog' }],
      });
      expect(adapter.exposedBuildOrderClause(query, {})).toEqual({
        blog: { name: SortOrder.ASC },
      });
    });

    it('should combine root and relation sorts', () => {
      const query = mockCrudParsedQuery({
        sort: [
          { field: 'name', order: SortOrder.ASC },
          { field: 'age', order: SortOrder.DESC, relation: 'posts' },
        ],
      });
      expect(adapter.exposedBuildOrderClause(query, {})).toEqual({
        name: SortOrder.ASC,
        posts: { age: SortOrder.DESC },
      });
    });

    it('should group multiple fields under same relation', () => {
      const query = mockCrudParsedQuery({
        sort: [
          { field: 'name', order: SortOrder.ASC, relation: 'posts' },
          { field: 'age', order: SortOrder.DESC, relation: 'posts' },
        ],
      });
      expect(adapter.exposedBuildOrderClause(query, {})).toEqual({
        posts: { name: SortOrder.ASC, age: SortOrder.DESC },
      });
    });
  });

  describe('validateWhereFields', () => {
    it('should not throw for undefined clause', () => {
      expect(() => adapter.exposedValidateWhereFields(undefined)).not.toThrow();
    });

    it('should not throw for valid root entity field', () => {
      expect(() =>
        adapter.exposedValidateWhereFields(Where.eq('name', 'foo')),
      ).not.toThrow();
    });

    it('should throw for invalid root entity field', () => {
      expect(() =>
        adapter.exposedValidateWhereFields(Where.eq('unknown', 'foo')),
      ).toThrow(BadRequestException);
    });

    it('should skip validation for relation-tagged condition', () => {
      const condition = Where.rel('posts', Where.eq('title', 'hello'));
      expect(() => adapter.exposedValidateWhereFields(condition)).not.toThrow();
    });

    it('should validate compound clause recursively', () => {
      const clause = Where.and(
        Where.eq('name', 'foo'),
        Where.eq('invalid', 'bar'),
      );
      expect(() => adapter.exposedValidateWhereFields(clause)).toThrow(
        BadRequestException,
      );
    });

    it('should pass compound clause mixing relation and valid root conditions', () => {
      const clause = Where.and(
        Where.eq('name', 'foo'),
        Where.rel('posts', Where.eq('title', 'hello')),
      );
      expect(() => adapter.exposedValidateWhereFields(clause)).not.toThrow();
    });

    it('should throw for invalid field inside compound with relation conditions', () => {
      const clause = Where.and(
        Where.eq('unknown', 'foo'),
        Where.rel('posts', Where.eq('title', 'hello')),
      );
      expect(() => adapter.exposedValidateWhereFields(clause)).toThrow(
        BadRequestException,
      );
    });
  });
});
