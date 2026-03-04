import { WhereOperator } from '@concepta/nestjs-common';

import { FederationException } from '../exceptions/federation.exception';
import { analyzeExecution } from '../execution-strategy';
import { FederatedRelation, FederationStrategy } from '../federation.types';
import { FilterAnalyzer } from '../filter-analyzer';

const makeRelation = (
  overrides: Partial<FederatedRelation> & { name: string },
): FederatedRelation => ({
  targetEntity: `${overrides.name}Entity`,
  cardinality: 'many',
  on: { from: 'id', to: `${overrides.name}Id` },
  isOwning: false,
  joinType: 'LEFT',
  ...overrides,
});

describe('analyzeExecution', () => {
  const posts = makeRelation({ name: 'posts' });
  const postsWithDistinct = makeRelation({
    name: 'posts',
    distinctFilter: {
      field: 'published',
      operator: WhereOperator.EQ,
      value: true,
    },
  });
  const comments = makeRelation({ name: 'comments' });

  it('should select ROOT_FIRST when no relation sorts or filters', () => {
    const filterAnalyzer = new FilterAnalyzer(undefined, [posts], new Set());
    const result = analyzeExecution(filterAnalyzer, { createdAt: 'DESC' }, [
      posts,
    ]);

    expect(result.strategy).toBe(FederationStrategy.ROOT_FIRST);
    expect(result.rootOrder).toEqual({ createdAt: 'DESC' });
    expect(result.relationOrders.size).toBe(0);
    expect(result.sortedRelationNames.size).toBe(0);
  });

  it('should select RELATION_FIRST when relation sort exists', () => {
    const filterAnalyzer = new FilterAnalyzer(
      undefined,
      [postsWithDistinct],
      new Set(['posts']),
    );
    const result = analyzeExecution(
      filterAnalyzer,
      { posts: { title: 'ASC' } },
      [postsWithDistinct],
    );

    expect(result.strategy).toBe(FederationStrategy.RELATION_FIRST);
    expect(result.rootOrder).toBeUndefined();
    expect(result.relationOrders.get('posts')).toEqual({ title: 'ASC' });
    expect(result.drivingRelation).toBe(postsWithDistinct);
  });

  it('should select RELATION_FIRST when relation filter exists', () => {
    const where = {
      field: 'title',
      operator: WhereOperator.EQ,
      value: 'hello',
      relation: 'posts',
    };
    const filterAnalyzer = new FilterAnalyzer(where, [posts], new Set());
    const result = analyzeExecution(filterAnalyzer, undefined, [posts]);

    expect(result.strategy).toBe(FederationStrategy.RELATION_FIRST);
    expect(result.drivingRelation).toBe(posts);
  });

  it('should separate mixed root and relation orders', () => {
    const filterAnalyzer = new FilterAnalyzer(
      undefined,
      [postsWithDistinct],
      new Set(['posts']),
    );
    const result = analyzeExecution(
      filterAnalyzer,
      { createdAt: 'DESC', posts: { title: 'ASC' } },
      [postsWithDistinct],
    );

    expect(result.rootOrder).toEqual({ createdAt: 'DESC' });
    expect(result.relationOrders.get('posts')).toEqual({ title: 'ASC' });
  });

  it('should throw when sorting on many-cardinality relation without distinctFilter', () => {
    const manyRelation = makeRelation({
      name: 'posts',
      cardinality: 'many',
    });
    const filterAnalyzer = new FilterAnalyzer(
      undefined,
      [manyRelation],
      new Set(['posts']),
    );

    expect(() =>
      analyzeExecution(filterAnalyzer, { posts: { title: 'ASC' } }, [
        manyRelation,
      ]),
    ).toThrow(FederationException);
  });

  it('should allow sorting on many-cardinality relation with distinctFilter', () => {
    const manyWithFilter = makeRelation({
      name: 'posts',
      cardinality: 'many',
      distinctFilter: {
        field: 'published',
        operator: WhereOperator.EQ,
        value: true,
      },
    });
    const filterAnalyzer = new FilterAnalyzer(
      undefined,
      [manyWithFilter],
      new Set(['posts']),
    );

    expect(() =>
      analyzeExecution(filterAnalyzer, { posts: { title: 'ASC' } }, [
        manyWithFilter,
      ]),
    ).not.toThrow();
  });

  it('should allow sorting on one-cardinality relation without distinctFilter', () => {
    const oneRelation = makeRelation({
      name: 'profile',
      cardinality: 'one',
    });
    const filterAnalyzer = new FilterAnalyzer(
      undefined,
      [oneRelation],
      new Set(['profile']),
    );

    expect(() =>
      analyzeExecution(filterAnalyzer, { profile: { bio: 'ASC' } }, [
        oneRelation,
      ]),
    ).not.toThrow();
  });

  it('should prefer sorted relation as driving over filtered relation', () => {
    const where = {
      field: 'body',
      operator: WhereOperator.EQ,
      value: 'test',
      relation: 'comments',
    };
    const filterAnalyzer = new FilterAnalyzer(
      where,
      [postsWithDistinct, comments],
      new Set(['posts']),
    );

    const result = analyzeExecution(
      filterAnalyzer,
      { posts: { title: 'ASC' } },
      [postsWithDistinct, comments],
    );

    expect(result.drivingRelation).toBe(postsWithDistinct);
  });

  it('should handle no order at all', () => {
    const filterAnalyzer = new FilterAnalyzer(undefined, [posts], new Set());
    const result = analyzeExecution(filterAnalyzer, undefined, [posts]);

    expect(result.strategy).toBe(FederationStrategy.ROOT_FIRST);
    expect(result.rootOrder).toBeUndefined();
    expect(result.relationOrders.size).toBe(0);
  });
});
