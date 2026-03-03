import { plainToInstance } from 'class-transformer';

import { PlainLiteralObject } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';

import {
  DeepPartial,
  HookContextInterface,
  JoinClause,
  RepositoryInterface,
  RepositoryMetadataInterface,
  RepositoryFindOptions,
  RepositoryFindOneOptions,
  RepositoryCreateOptions,
  RepositoryUpdateOptions,
  RepositoryUpsertOptions,
  RepositoryDeleteOptions,
  RepositoryRestoreOptions,
  RuntimeException,
  WhereClause,
  WhereCompoundOperator,
  isWhereCondition,
  isWhereCompound,
} from '@concepta/nestjs-common';
import { HookMethodKeyType, HookResolverService } from '@concepta/nestjs-hook';

import { RepoPermeatorFactory } from '../hooks/repo-permeator-factory';
import { RepoHook } from '../hooks/repository-hook.decorators';

/**
 * Abstract repository adapter that implements DTO transformation.
 *
 * Concrete repository implementations should extend this class.
 *
 * @example
 * ```typescript
 * class TypeOrmRepository<Entity> extends RepositoryAdapter<Entity> {
 *   async find(options?) {
 *     return await this.repo.find(options);
 *   }
 *
 *   async create(entity, options?) {
 *     return await this.repo.save(entity);
 *   }
 * }
 * ```
 */
export abstract class RepositoryAdapter<Entity extends PlainLiteralObject>
  implements RepositoryInterface<Entity>
{
  abstract readonly metadata: RepositoryMetadataInterface<Entity>;

  private _permeator?: RepoPermeatorFactory<Entity>;

  constructor(protected readonly hookResolver?: HookResolverService) {}

  protected get permeator(): RepoPermeatorFactory<Entity> {
    if (!this._permeator) {
      this._permeator = new RepoPermeatorFactory<Entity>(
        this.runHooks.bind(this),
        this.metadata.name,
      );
    }
    return this._permeator;
  }

  // Query operations

  abstract find(options?: RepositoryFindOptions<Entity>): Promise<Entity[]>;

  abstract findOne(
    options: RepositoryFindOneOptions<Entity>,
  ): Promise<Entity | null>;

  abstract count(options?: RepositoryFindOptions<Entity>): Promise<number>;

  abstract findAndCount(
    options?: RepositoryFindOptions<Entity>,
  ): Promise<[Entity[], number]>;

  // Create operations

  abstract create(
    entity: DeepPartial<Entity>,
    options?: RepositoryCreateOptions,
  ): Promise<Entity>;

  abstract createMany(
    entities: DeepPartial<Entity>[],
    options?: RepositoryCreateOptions,
  ): Promise<Entity[]>;

  // Update operations

  abstract update(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity>;

  abstract upsert(
    entity: DeepPartial<Entity>,
    options?: RepositoryUpsertOptions,
  ): Promise<Entity>;

  abstract replace(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity>;

  // Delete operations

  abstract delete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity>;

  abstract softDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity>;

  abstract restore(
    entity: Entity,
    options?: RepositoryRestoreOptions,
  ): Promise<Entity>;

  // Utility methods

  abstract transform(entityLike: DeepPartial<Entity>): Entity;

  abstract merge(
    mergeIntoEntity: Entity,
    ...entityLikes: DeepPartial<Entity>[]
  ): Entity;

  /**
   * Prepare a DTO for write operations.
   * Transforms DTO to entity instance if needed.
   */
  prepare(dto: DeepPartial<Entity>): Entity | undefined {
    if (!isObject(dto) || !Object.keys(dto).length) {
      return undefined;
    }

    const entityType = this.metadata.type;

    if (dto instanceof entityType) {
      return dto;
    }

    return plainToInstance(entityType, dto);
  }

  /**
   * Get primary key column names from metadata
   */
  protected getPrimaryColumns(): (keyof Entity & string)[] {
    return this.metadata.columns
      .filter((col) => col.isPrimary)
      .map((col) => col.name);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JoinClause resolution (ORM-agnostic)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Resolve incomplete JoinClauses using repository relation metadata.
   * Fills in `on` (and optionally `through`/`cardinality`) when omitted.
   *
   * Called by ORM adapters before translating to native find options.
   */
  protected resolveJoinClauses(join?: JoinClause[]): JoinClause[] | undefined {
    if (!join?.length) return undefined;

    const relMap = new Map(this.metadata.relations?.map((r) => [r.name, r]));

    return join.map((j) => {
      if (j.on) return j;

      const rel = relMap.get(j.relation);

      if (!rel) {
        throw new RuntimeException({
          message: 'Unknown relation "%s" on entity "%s"',
          messageParams: [j.relation, this.metadata.name],
        });
      }

      return {
        ...j,
        on: rel.on,
        cardinality: j.cardinality ?? rel.cardinality,
        through: j.through ?? rel.through,
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WhereClause AST helpers (ORM-agnostic)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Flatten a WhereClause tree into Disjunctive Normal Form:
   * an array of AND-branches, where each branch is a flat list
   * of WhereClause leaves. The outer array represents OR.
   *
   * Leaves are either WhereConditions or not(...) compounds
   * preserved for ORM-specific translation.
   */
  protected toDnf(clause: WhereClause): WhereClause[][] {
    if (isWhereCondition(clause)) {
      return [[clause]];
    }

    if (!isWhereCompound(clause)) return [];

    switch (clause.operator) {
      case WhereCompoundOperator.OR:
        return clause.conditions.flatMap((c) => this.toDnf(c));

      case WhereCompoundOperator.AND: {
        const groups = clause.conditions.map((c) => this.toDnf(c));
        const nonEmpty = groups.filter((g) => g.length > 0);
        if (nonEmpty.length === 0) return [];
        if (nonEmpty.length === 1) return nonEmpty[0];
        return this.cartesianProduct(nonEmpty);
      }

      default:
        return [];
    }
  }

  protected static readonly MAX_DNF_BRANCHES = 50;

  /**
   * Compute cartesian product of AND-groups of OR-branches.
   * Distributes AND over OR at the AST level.
   *
   * e.g., `[[[a]], [[b], [c]]] => [[a, b], [a, c]]`
   */
  protected cartesianProduct(groups: WhereClause[][][]): WhereClause[][] {
    let result = groups[0];

    for (let i = 1; i < groups.length; i++) {
      const nextGroup = groups[i];
      const newResult: WhereClause[][] = [];
      for (const existing of result) {
        for (const next of nextGroup) {
          if (newResult.length >= RepositoryAdapter.MAX_DNF_BRANCHES) {
            throw new RuntimeException({
              message: 'Where clause too complex: exceeded %d DNF branches',
              messageParams: [RepositoryAdapter.MAX_DNF_BRANCHES],
            });
          }
          newResult.push([...existing, ...next]);
        }
      }
      result = newResult;
    }

    return result;
  }

  /**
   * Run repository hooks for a specific method key.
   *
   * @param methodKey - The hook method key (e.g., 'beforeFind', 'afterCreate')
   * @param payload - The payload to pass through hooks
   * @param ctx - The hook context
   * @returns The payload after processing by applicable hooks
   */
  protected async runHooks<T>(
    methodKey: HookMethodKeyType,
    payload: T,
    ctx: HookContextInterface | undefined,
  ): Promise<T> {
    if (!this.hookResolver) {
      return payload;
    }

    return this.hookResolver.execute(RepoHook, methodKey, payload, ctx);
  }
}
