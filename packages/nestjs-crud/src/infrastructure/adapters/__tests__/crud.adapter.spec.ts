import { BadRequestException, Type } from '@nestjs/common';

import {
  ActionEnum,
  AppContextHost,
  Operation,
  RepositoryInterface,
  Where,
  WhereOperator,
} from '@concepta/nestjs-common';

import { TestCrudAdapter } from '../../../__fixtures__/crud/adapters/test-crud.adapter';
import { CrudContextOptionsInterface } from '../../interceptors/interfaces/crud-context-options.interface';
import { CrudContextInterface } from '../../interceptors/interfaces/crud-context.interface';
import { CrudParsedQueryInterface } from '../../request/interfaces/crud-parsed-query.interface';

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

function createMockRepository(): RepositoryInterface<TestEntity> {
  return {
    metadata: {
      name: 'TestEntity',
      type: TestEntityClass as Type<TestEntity>,
      columns: [
        { name: 'id', isPrimary: true, isRemoveDate: false },
        { name: 'name', isPrimary: false, isRemoveDate: false },
        { name: 'age', isPrimary: false, isRemoveDate: false },
      ],
    },
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    replace: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    transform: jest.fn(),
    merge: jest.fn(),
    prepare: jest.fn((dto) => dto as TestEntity),
  };
}

function makeQuery(
  overrides: Partial<CrudParsedQueryInterface<TestEntity>> = {},
): CrudParsedQueryInterface<TestEntity> {
  return {
    fields: [],
    search: undefined,
    filter: [],
    or: [],
    sort: [],
    limit: undefined,
    offset: undefined,
    page: undefined,
    cache: undefined,
    includeDeleted: undefined,
    ...overrides,
  };
}

function makeContext(
  overrides: Partial<CrudContextInterface<TestEntity>> = {},
): CrudContextInterface<TestEntity> {
  return AppContextHost.merge<CrudContextInterface<TestEntity>>(() => ({
    entity: overrides.entity ?? 'TestEntity',
    params: overrides.params ?? {},
    query: overrides.query ?? makeQuery(),
    options: overrides.options ?? {},
    operation: overrides.operation ?? Operation.Read,
    action: overrides.action ?? ActionEnum.READ,
    locals: overrides.locals ?? {},
    hooks: overrides.hooks ?? [],
  }));
}

describe('CrudAdapter', () => {
  let adapter: TestCrudAdapter<TestEntity>;

  beforeAll(() => {
    adapter = new TestCrudAdapter(createMockRepository());
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
      expect(adapter.getTake(makeQuery({ limit: 25 }), {})).toEqual(25);
    });

    it('should cap query.limit to maxLimit', () => {
      expect(
        adapter.getTake(makeQuery({ limit: 100 }), { maxLimit: 50 }),
      ).toEqual(50);
    });

    it('should return query.limit when under maxLimit', () => {
      expect(
        adapter.getTake(makeQuery({ limit: 10 }), { maxLimit: 50 }),
      ).toEqual(10);
    });

    it('should fall back to options.limit when no query.limit', () => {
      expect(adapter.getTake(makeQuery(), { limit: 20 })).toEqual(20);
    });

    it('should cap options.limit to maxLimit', () => {
      expect(
        adapter.getTake(makeQuery(), { limit: 100, maxLimit: 50 }),
      ).toEqual(50);
    });

    it('should return options.limit when under maxLimit', () => {
      expect(adapter.getTake(makeQuery(), { limit: 10, maxLimit: 50 })).toEqual(
        10,
      );
    });

    it('should return maxLimit when no query.limit and no options.limit', () => {
      expect(adapter.getTake(makeQuery(), { maxLimit: 50 })).toEqual(50);
    });

    it('should return null when no limits set', () => {
      expect(adapter.getTake(makeQuery(), {})).toBeNull();
    });
  });

  describe('getSkip', () => {
    it('should calculate skip from page and take', () => {
      expect(adapter.getSkip(makeQuery({ page: 3 }), 10)).toEqual(20);
    });

    it('should return offset when no page', () => {
      expect(adapter.getSkip(makeQuery({ offset: 15 }), 10)).toEqual(15);
    });

    it('should return null when no page and no offset', () => {
      expect(adapter.getSkip(makeQuery(), 10)).toBeNull();
    });

    it('should return null when page is set but take is null', () => {
      expect(adapter.getSkip(makeQuery({ page: 2 }), null)).toBeNull();
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
      const ctx = makeContext();
      expect(
        adapter.prepareEntityBeforeSave(null as never, ctx),
      ).toBeUndefined();
    });

    it('should return undefined for empty object', () => {
      const ctx = makeContext();
      expect(adapter.prepareEntityBeforeSave({} as never, ctx)).toBeUndefined();
    });

    it('should return entity with dto field values', () => {
      const dto = { id: '1', name: 'Test' } as TestEntity;
      const ctx = makeContext();
      const result = adapter.prepareEntityBeforeSave(dto, ctx);
      expect(result).toBeDefined();
      expect(result?.id).toEqual('1');
      expect(result?.name).toEqual('Test');
    });

    it('should apply matching route params to entity', () => {
      const dto = { id: '1', name: 'Test' } as TestEntity;
      const context = makeContext({ params: { id: 'overridden' } });
      const result = adapter.prepareEntityBeforeSave(dto, context);
      expect(result).toBeDefined();
      expect(result?.id).toEqual('overridden');
    });

    it('should ignore route params not present in dto', () => {
      const dto = { name: 'Test' } as TestEntity;
      const context = makeContext({
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
      const ctx = makeContext();
      expect(adapter.exposedBuildWhere(ctx)).toBeUndefined();
    });

    it('should convert single param to eq condition', () => {
      const ctx = makeContext({ params: { id: '5' } });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('id', '5'));
    });

    it('should combine multiple params with and', () => {
      const ctx = makeContext({ params: { id: '1', name: 'test' } });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(
        Where.and(Where.eq('id', '1'), Where.eq('name', 'test')),
      );
    });

    it('should combine params and query.filter with and', () => {
      const ctx = makeContext({
        params: { id: '5' },
        query: makeQuery({
          filter: [{ field: 'name', operator: WhereOperator.EQ, value: 'foo' }],
        }),
      });
      expect(adapter.exposedBuildWhere(ctx)).toEqual(
        Where.and(Where.eq('id', '5'), Where.eq('name', 'foo')),
      );
    });

    describe('options.query.filter', () => {
      it('should convert WhereCondition[] to where conditions', () => {
        const ctx = makeContext({
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
        const ctx = makeContext({
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
        const ctx = makeContext({
          options: { query: { filter: [] } },
        });
        expect(adapter.exposedBuildWhere(ctx)).toBeUndefined();
      });
    });

    describe('query.search', () => {
      it('should convert query.search SCondition to where', () => {
        const ctx = makeContext({
          query: makeQuery({ search: { name: { $contains: 'foo' } } }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(
          Where.contains('name', 'foo'),
        );
      });

      it('should use query.search even when filters are present', () => {
        const ctx = makeContext({
          query: makeQuery({
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
        const ctx = makeContext({
          query: makeQuery({
            filter: [
              { field: 'name', operator: WhereOperator.EQ, value: 'foo' },
            ],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('name', 'foo'));
      });

      it('should convert multiple filters to and where', () => {
        const ctx = makeContext({
          query: makeQuery({
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
        const ctx = makeContext({
          query: makeQuery({
            or: [{ field: 'name', operator: WhereOperator.EQ, value: 'bar' }],
          }),
        });
        expect(adapter.exposedBuildWhere(ctx)).toEqual(Where.eq('name', 'bar'));
      });
    });

    describe('filter + or combined', () => {
      it('should create or with single filter and single or', () => {
        const ctx = makeContext({
          query: makeQuery({
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
        const ctx = makeContext({
          query: makeQuery({
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
});
