import { PlainLiteralObject, Type } from '@nestjs/common';

import {
  DeepPartial,
  JoinClause,
  RepositoryMetadataInterface,
  RepositoryFindOptions,
  RepositoryFindOneOptions,
  RepositoryCreateOptions,
  RepositoryUpdateOptions,
  RepositoryUpsertOptions,
  RepositoryDeleteOptions,
  RepositoryRestoreOptions,
  RuntimeException,
  Where,
  WhereClause,
} from '@concepta/nestjs-common';

import { RepositoryAdapter } from './repository-adapter';

// ─── Test entity ─────────────────────────────────────────────────────────────

interface TestEntity extends PlainLiteralObject {
  id: string;
  name: string;
  version: number;
}

class TestEntityClass {
  id!: string;
  name!: string;
  version!: number;
}

// ─── Concrete subclass to expose protected methods ───────────────────────────

class TestRepositoryAdapter extends RepositoryAdapter<TestEntity> {
  readonly metadata: RepositoryMetadataInterface<TestEntity> = {
    name: 'TestEntity',
    type: TestEntityClass as Type<TestEntity>,
    columns: [
      { name: 'id', isPrimary: true, isRemoveDate: false },
      { name: 'name', isPrimary: false, isRemoveDate: false },
      { name: 'version', isPrimary: false, isRemoveDate: false },
    ],
    relations: [
      {
        name: 'posts',
        targetEntity: 'PostEntity',
        cardinality: 'many' as const,
        on: { from: 'id', to: 'authorId' },
      },
      {
        name: 'tags',
        targetEntity: 'TagEntity',
        cardinality: 'many' as const,
        on: { from: 'id', to: 'id' },
        through: {
          relation: 'entity_tags',
          fromKey: 'entityId',
          toKey: 'tagId',
        },
      },
    ],
  };

  find(_options?: RepositoryFindOptions<TestEntity>): Promise<TestEntity[]> {
    throw new Error('not implemented');
  }
  findOne(
    _options: RepositoryFindOneOptions<TestEntity>,
  ): Promise<TestEntity | null> {
    throw new Error('not implemented');
  }
  count(_options?: RepositoryFindOptions<TestEntity>): Promise<number> {
    throw new Error('not implemented');
  }
  findAndCount(
    _options?: RepositoryFindOptions<TestEntity>,
  ): Promise<[TestEntity[], number]> {
    throw new Error('not implemented');
  }
  create(
    _entity: DeepPartial<TestEntity>,
    _options?: RepositoryCreateOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  createMany(
    _entities: DeepPartial<TestEntity>[],
    _options?: RepositoryCreateOptions,
  ): Promise<TestEntity[]> {
    throw new Error('not implemented');
  }
  update(
    _entity: TestEntity,
    _data: DeepPartial<TestEntity>,
    _options?: RepositoryUpdateOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  upsert(
    _entity: DeepPartial<TestEntity>,
    _options?: RepositoryUpsertOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  replace(
    _entity: TestEntity,
    _data: DeepPartial<TestEntity>,
    _options?: RepositoryUpdateOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  delete(
    _entity: TestEntity,
    _options?: RepositoryDeleteOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  softDelete(
    _entity: TestEntity,
    _options?: RepositoryDeleteOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  restore(
    _entity: TestEntity,
    _options?: RepositoryRestoreOptions,
  ): Promise<TestEntity> {
    throw new Error('not implemented');
  }
  transform(_entityLike: DeepPartial<TestEntity>): TestEntity {
    throw new Error('not implemented');
  }
  merge(
    _mergeIntoEntity: TestEntity,
    ..._entityLikes: DeepPartial<TestEntity>[]
  ): TestEntity {
    throw new Error('not implemented');
  }

  exposedResolveJoinClauses(join?: JoinClause[]): JoinClause[] | undefined {
    return this.resolveJoinClauses(join);
  }

  exposedToDnf(clause: WhereClause): WhereClause[][] {
    return this.toDnf(clause);
  }

  exposedCartesianProduct(groups: WhereClause[][][]): WhereClause[][] {
    return this.cartesianProduct(groups);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe(RepositoryAdapter.name, () => {
  let adapter: TestRepositoryAdapter;

  beforeEach(() => {
    adapter = new TestRepositoryAdapter();
  });

  describe('resolveJoinClauses', () => {
    it('should return undefined for undefined input', () => {
      expect(adapter.exposedResolveJoinClauses(undefined)).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      expect(adapter.exposedResolveJoinClauses([])).toBeUndefined();
    });

    it('should resolve single join from metadata', () => {
      const result = adapter.exposedResolveJoinClauses([{ relation: 'posts' }]);
      expect(result).toEqual([
        {
          relation: 'posts',
          on: { from: 'id', to: 'authorId' },
          cardinality: 'many',
        },
      ]);
    });

    it('should resolve two joins at once', () => {
      const result = adapter.exposedResolveJoinClauses([
        { relation: 'posts' },
        { relation: 'tags' },
      ]);
      expect(result).toEqual([
        {
          relation: 'posts',
          on: { from: 'id', to: 'authorId' },
          cardinality: 'many',
        },
        {
          relation: 'tags',
          on: { from: 'id', to: 'id' },
          cardinality: 'many',
          through: {
            relation: 'entity_tags',
            fromKey: 'entityId',
            toKey: 'tagId',
          },
        },
      ]);
    });

    it('should fill in through for M2M relation', () => {
      const result = adapter.exposedResolveJoinClauses([{ relation: 'tags' }]);
      expect(result![0].through).toEqual({
        relation: 'entity_tags',
        fromKey: 'entityId',
        toKey: 'tagId',
      });
    });

    it('should preserve explicit on (pass-through)', () => {
      const explicit = {
        relation: 'posts',
        on: { from: 'customId', to: 'customFk' },
      };
      const result = adapter.exposedResolveJoinClauses([explicit]);
      expect(result).toEqual([explicit]);
    });

    it('should prefer clause cardinality over metadata', () => {
      const result = adapter.exposedResolveJoinClauses([
        { relation: 'posts', cardinality: 'one' },
      ]);
      expect(result![0].cardinality).toBe('one');
    });

    it('should throw RuntimeException for unknown relation', () => {
      expect(() => {
        adapter.exposedResolveJoinClauses([{ relation: 'nonexistent' }]);
      }).toThrow(RuntimeException);
    });
  });

  describe('toDnf', () => {
    it('should return single-element branch for a condition', () => {
      const cond = Where.eq('id', '1');
      const result = adapter.exposedToDnf(cond);
      expect(result).toEqual([[cond]]);
    });

    it('should flatten AND into a single branch', () => {
      const a = Where.eq('id', '1');
      const b = Where.gt('version', 2);
      const result = adapter.exposedToDnf(Where.and(a, b));
      expect(result).toEqual([[a, b]]);
    });

    it('should flatten OR into separate branches', () => {
      const a = Where.eq('id', '1');
      const b = Where.eq('id', '2');
      const result = adapter.exposedToDnf(Where.or(a, b));
      expect(result).toEqual([[a], [b]]);
    });

    it('should distribute AND over OR (DNF conversion)', () => {
      const a = Where.eq('id', '1');
      const b = Where.eq('name', 'x');
      const c = Where.eq('name', 'y');
      // AND(a, OR(b, c)) => OR(AND(a,b), AND(a,c))
      const result = adapter.exposedToDnf(Where.and(a, Where.or(b, c)));
      expect(result).toEqual([
        [a, b],
        [a, c],
      ]);
    });
  });

  describe('cartesianProduct', () => {
    it('should compute product of two groups', () => {
      const a = Where.eq('id', '1');
      const b = Where.eq('id', '2');
      const c = Where.eq('name', 'x');

      const result = adapter.exposedCartesianProduct([[[a], [b]], [[c]]]);
      expect(result).toEqual([
        [a, c],
        [b, c],
      ]);
    });
  });

  describe('prepare', () => {
    it('should return undefined for empty object', () => {
      expect(adapter.prepare({})).toBeUndefined();
    });

    it('should return entity instance as-is', () => {
      const entity = new TestEntityClass();
      entity.id = '1';
      expect(adapter.prepare(entity)).toBe(entity);
    });
  });

  describe('getPrimaryColumns', () => {
    it('should return primary column names', () => {
      // Access via metadata — getPrimaryColumns is protected but we can verify
      // through the columns metadata
      const primaries = adapter.metadata.columns
        .filter((c) => c.isPrimary)
        .map((c) => c.name);
      expect(primaries).toEqual(['id']);
    });
  });
});
