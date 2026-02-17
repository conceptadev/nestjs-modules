import {
  And,
  Between,
  Equal,
  FindOperator,
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
  EntityManager,
} from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import {
  DeepPartial,
  RepositoryContextInterface,
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
  WhereCondition,
  WhereOperator,
  isWhereCondition,
  ModelQueryException,
} from '@concepta/nestjs-common';
import { HookResolverService } from '@concepta/nestjs-hook';
import {
  RepoHookMethodKey,
  RepositoryAdapter,
} from '@concepta/nestjs-repository';

import { TypeOrmEntityNameException } from '../exceptions/typeorm-entity-name.exception';

import { buildEntity, buildColumns } from './typeorm-options.schema';

/**
 * TypeORM implementation of RepositoryInterface.
 * Wraps a TypeORM Repository with transaction-aware operations.
 */
export class TypeOrmRepository<
  Entity extends PlainLiteralObject,
> extends RepositoryAdapter<Entity> {
  readonly metadata: RepositoryMetadataInterface<Entity>;

  /**
   * Constructor
   *
   * @param repo - TypeORM repository instance
   * @param transactionKey - optional key for looking up transaction (e.g., "typeorm:default")
   * @param hookResolver - optional hook resolver service
   */
  constructor(
    private readonly repo: Repository<Entity>,
    private readonly transactionKey?: string,
    hookResolver?: HookResolverService,
  ) {
    super(hookResolver);

    const entityName = repo.metadata?.name || repo.metadata?.targetName;

    if (!entityName) {
      throw new TypeOrmEntityNameException();
    }

    const entityType = buildEntity(repo.target, entityName);
    const columns = buildColumns<Entity>(repo.metadata.columns);

    this.metadata = {
      name: entityName,
      type: entityType,
      columns,
    };
  }

  /**
   * Get the repository, using transactional EntityManager if available
   */
  protected getRepo(ctx?: RepositoryContextInterface): Repository<Entity> {
    if (this.transactionKey) {
      const tx = ctx?.trx?.get(this.transactionKey);
      if (tx) {
        return tx.getClient<EntityManager>().getRepository(this.metadata.type);
      }
    }
    return this.repo;
  }

  /**
   * Mark the transaction as dirty (write operation occurred)
   */
  protected markDirty(ctx?: RepositoryContextInterface): void {
    if (this.transactionKey) {
      ctx?.trx?.get(this.transactionKey)?.markDirty();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WhereClause → TypeORM translation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Translate a WhereClause into TypeORM FindOptionsWhere[].
   *
   * Two-phase approach:
   * 1. Flatten WhereClause AST into DNF (OR of AND-branches) — agnostic
   * 2. Translate each AND-branch to a TypeORM FindOptionsWhere — ORM-specific
   */
  protected translateWhere(
    clause?: WhereClause,
  ): FindOptionsWhere<Entity>[] | undefined {
    if (!clause) return undefined;
    const dnf = this.toDnf(clause);
    if (dnf.length === 0) return undefined;
    return dnf.map((branch) => this.branchToFindOptionsWhere(branch));
  }

  /**
   * Convert an AND-branch of WhereClause leaves into a single
   * TypeORM FindOptionsWhere. Same-field conditions are merged
   * with TypeORM And().
   */
  protected branchToFindOptionsWhere(
    leaves: WhereClause[],
  ): FindOptionsWhere<Entity> {
    const result: Record<string, FindOperator<unknown>> = {};

    for (const leaf of leaves) {
      const entries = this.leafToFindOperatorEntries(leaf);
      for (const [field, op] of entries) {
        if (result[field] !== undefined) {
          result[field] = And(result[field], op);
        } else {
          result[field] = op;
        }
      }
    }

    return result as FindOptionsWhere<Entity>;
  }

  /**
   * Convert a leaf WhereCondition to [field, FindOperator] pair.
   */
  protected leafToFindOperatorEntries(
    leaf: WhereClause,
  ): [string, FindOperator<unknown>][] {
    if (isWhereCondition(leaf)) {
      return [[leaf.field, this.toFindOperator(leaf)]];
    }

    return [];
  }

  /**
   * Map a WhereCondition to a TypeORM FindOperator.
   */
  protected toFindOperator(cond: WhereCondition): FindOperator<unknown> {
    switch (cond.operator) {
      case WhereOperator.EQ:
        return Equal(cond.value);
      case WhereOperator.NE:
        return Not(Equal(cond.value));
      case WhereOperator.GT:
        return MoreThan(cond.value);
      case WhereOperator.GTE:
        return MoreThanOrEqual(cond.value);
      case WhereOperator.LT:
        return LessThan(cond.value);
      case WhereOperator.LTE:
        return LessThanOrEqual(cond.value);
      case WhereOperator.CONTAINS:
        return Like(`%${cond.value}%`);
      case WhereOperator.NCONTAINS:
        return Not(Like(`%${cond.value}%`));
      case WhereOperator.STARTS:
        return Like(`${cond.value}%`);
      case WhereOperator.NSTARTS:
        return Not(Like(`${cond.value}%`));
      case WhereOperator.ENDS:
        return Like(`%${cond.value}`);
      case WhereOperator.NENDS:
        return Not(Like(`%${cond.value}`));
      case WhereOperator.IN:
        return In(cond.value);
      case WhereOperator.NIN:
        return Not(In(cond.value));
      case WhereOperator.IS_NULL:
        return IsNull();
      case WhereOperator.NOT_NULL:
        return Not(IsNull());
      case WhereOperator.BETWEEN:
        return Between(cond.value[0], cond.value[1]);
      default:
        throw new RuntimeException({
          message: 'Unknown where operator "%s"',
          messageParams: [(cond as WhereCondition).operator],
        });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Internal: build native TypeORM FindOptions from our options
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Convert RepositoryFindOptions to TypeORM FindManyOptions.
   */
  protected buildNativeFindManyOptions(
    options: RepositoryFindOptions<Entity>,
  ): import('typeorm').FindManyOptions<Entity> {
    const where = this.translateWhere(options.where);
    return {
      select: options.select as (keyof Entity & string)[] | undefined,
      where,
      order: options.order as
        | import('typeorm').FindOptionsOrder<Entity>
        | undefined,
      skip: options.skip,
      take: options.take,
      withDeleted: options.withDeleted,
    };
  }

  /**
   * Convert RepositoryFindOneOptions to TypeORM FindOneOptions.
   */
  protected buildNativeFindOneOptions(
    options: RepositoryFindOneOptions<Entity>,
  ): import('typeorm').FindOneOptions<Entity> {
    const where = this.translateWhere(options.where);
    return {
      select: options.select as (keyof Entity & string)[] | undefined,
      where,
      order: options.order as
        | import('typeorm').FindOptionsOrder<Entity>
        | undefined,
      withDeleted: options.withDeleted,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Query operations
  // ═══════════════════════════════════════════════════════════════════════════

  async find(options: RepositoryFindOptions<Entity> = {}): Promise<Entity[]> {
    const ctx = options.ctx;

    try {
      // Before hooks
      let scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_READ,
        options,
        ctx,
      );
      scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_FIND,
        scopedOptions,
        ctx,
      );

      // Execute
      const findOptions = this.buildNativeFindManyOptions(scopedOptions);
      let scopedResult = await this.getRepo(ctx).find(findOptions);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_FIND,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_READ,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async findOne(
    options: RepositoryFindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const ctx = options.ctx;

    try {
      // Before hooks
      let scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_READ,
        options,
        ctx,
      );
      scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_FIND_ONE,
        scopedOptions,
        ctx,
      );

      // Execute
      const findOptions = this.buildNativeFindOneOptions(scopedOptions);
      let scopedResult = await this.getRepo(ctx).findOne(findOptions);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_FIND_ONE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_READ,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async count(options: RepositoryFindOptions<Entity> = {}): Promise<number> {
    const ctx = options.ctx;

    try {
      // Before hooks
      let scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_READ,
        options,
        ctx,
      );
      scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_COUNT,
        scopedOptions,
        ctx,
      );

      // Execute
      const findOptions = this.buildNativeFindManyOptions(scopedOptions);
      let scopedResult = await this.getRepo(ctx).count(findOptions);

      // After hooks (no AFTER_READ — result is a number, not entity data)
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_COUNT,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async findAndCount(
    options: RepositoryFindOptions<Entity> = {},
  ): Promise<[Entity[], number]> {
    const ctx = options.ctx;

    try {
      // Before hooks
      let scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_READ,
        options,
        ctx,
      );
      scopedOptions = await this.runHooks(
        RepoHookMethodKey.BEFORE_FIND_AND_COUNT,
        scopedOptions,
        ctx,
      );

      // Execute
      const findOptions = this.buildNativeFindManyOptions(scopedOptions);
      let scopedResult = await this.getRepo(ctx).findAndCount(findOptions);

      // After hooks (no AFTER_READ — result is [Entity[], number], not entity data)
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_FIND_AND_COUNT,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  // Create operations

  async create(
    entity: DeepPartial<Entity>,
    options?: RepositoryCreateOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_WRITE,
        entity,
        ctx,
      );
      scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_CREATE,
        scopedEntity,
        ctx,
      );

      // Execute
      let scopedResult = await this.getRepo(ctx).save(scopedEntity);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_CREATE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_WRITE,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async createMany(
    entities: DeepPartial<Entity>[],
    options?: RepositoryCreateOptions,
  ): Promise<Entity[]> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntities = await this.runHooks(
        RepoHookMethodKey.BEFORE_WRITE,
        entities,
        ctx,
      );
      scopedEntities = await this.runHooks(
        RepoHookMethodKey.BEFORE_CREATE_MANY,
        scopedEntities,
        ctx,
      );

      // Execute
      let scopedResult = await this.getRepo(ctx).save(scopedEntities);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_CREATE_MANY,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_WRITE,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  // Update operations

  async update(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedData = await this.runHooks(
        RepoHookMethodKey.BEFORE_WRITE,
        data,
        ctx,
      );
      scopedData = await this.runHooks(
        RepoHookMethodKey.BEFORE_UPDATE,
        scopedData,
        ctx,
      );

      // Execute
      const repo = this.getRepo(ctx);
      const merged = repo.merge(entity, scopedData);
      let scopedResult = await repo.save(merged);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_UPDATE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_WRITE,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async upsert(
    entity: DeepPartial<Entity>,
    options?: RepositoryUpsertOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_WRITE,
        entity,
        ctx,
      );
      scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_UPSERT,
        scopedEntity,
        ctx,
      );

      // Execute
      const repo = this.getRepo(ctx);
      const conflictPaths = this.getPrimaryColumns();
      const insertResult = await repo.upsert(scopedEntity, conflictPaths);

      // Build primary key lookup from InsertResult identifiers,
      // falling back to the input entity for pre-set keys
      const identifiers = insertResult.identifiers[0] ?? {};
      const primaryKeys: Partial<Record<keyof Entity, Entity[keyof Entity]>> =
        {};

      for (const col of conflictPaths) {
        const value = identifiers[col] ?? scopedEntity[col];

        if (value === undefined) {
          throw new Error(`Upsert requires primary key "${col}" to be set`);
        }

        primaryKeys[col] = value;
      }

      let scopedResult = await repo.findOne({ where: primaryKeys });

      if (!scopedResult) {
        throw new Error('Upsert failed: entity not found after upsert');
      }

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_UPSERT,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_WRITE,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async replace(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedData = await this.runHooks(
        RepoHookMethodKey.BEFORE_WRITE,
        data,
        ctx,
      );
      scopedData = await this.runHooks(
        RepoHookMethodKey.BEFORE_REPLACE,
        scopedData,
        ctx,
      );

      // Execute
      const repo = this.getRepo(ctx);
      const replaced = repo.merge(entity, scopedData);
      let scopedResult = await repo.save(replaced);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_REPLACE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_WRITE,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  // Delete operations

  async delete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_DESTROY,
        entity,
        ctx,
      );
      scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_DELETE,
        scopedEntity,
        ctx,
      );

      // Execute (TypeORM uses `remove` for hard delete)
      let scopedResult = await this.getRepo(ctx).remove(scopedEntity);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_DELETE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_DESTROY,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async softDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_TRANSITION,
        entity,
        ctx,
      );
      scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_SOFT_DELETE,
        scopedEntity,
        ctx,
      );

      // Execute (TypeORM uses `softRemove` for soft delete)
      let scopedResult = await this.getRepo(ctx).softRemove(scopedEntity);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_SOFT_DELETE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_TRANSITION,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  async restore(
    entity: Entity,
    options?: RepositoryRestoreOptions,
  ): Promise<Entity> {
    const ctx = options?.ctx;
    this.markDirty(ctx);

    try {
      // Before hooks
      let scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_TRANSITION,
        entity,
        ctx,
      );
      scopedEntity = await this.runHooks(
        RepoHookMethodKey.BEFORE_RESTORE,
        scopedEntity,
        ctx,
      );

      // Execute
      let scopedResult = await this.getRepo(ctx).recover(scopedEntity);

      // After hooks
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_RESTORE,
        scopedResult,
        ctx,
      );
      scopedResult = await this.runHooks(
        RepoHookMethodKey.AFTER_TRANSITION,
        scopedResult,
        ctx,
      );

      return scopedResult;
    } catch (e) {
      throw new ModelQueryException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  // Utility methods

  transform(entityLike: DeepPartial<Entity>): Entity {
    return this.repo.create(entityLike);
  }

  merge(
    mergeIntoEntity: Entity,
    ...entityLikes: DeepPartial<Entity>[]
  ): Entity {
    return this.repo.merge(mergeIntoEntity, ...entityLikes);
  }
}
