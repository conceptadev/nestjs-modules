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
  FindOptionsRelations,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import {
  AppContextHost,
  AppContextLike,
  DeepPartial,
  RuntimeException,
  HookResolverService,
} from '@concepta/rockets-app';
import {
  isWhereCondition,
  JoinClause,
  RelationActionConfig,
  TrxCtx,
  RepositoryAdapter,
  RepositoryCreateOptions,
  RepositoryDeleteOptions,
  RepositoryFindOneOptions,
  RepositoryFindOptions,
  RepositoryMetadataInterface,
  RepositoryRestoreOptions,
  RepositoryUpdateOptions,
  RepositoryUpsertOptions,
  WhereClause,
  WhereCondition,
  WhereOperator,
} from '@concepta/rockets-repository';

import { TypeOrmEntityNameException } from '../exceptions/typeorm-entity-name.exception';

import {
  buildEntity,
  buildColumns,
  buildOrder,
  buildRelations,
} from './typeorm-options.schema';

/**
 * Options for constructing a TypeOrmRepository.
 */
export interface TypeOrmRepositoryOptions {
  entityKey: string;
  transactionKey?: string;
  hookResolver?: HookResolverService;
  relationsConfig?: Record<string, RelationActionConfig>;
}

/**
 * TypeORM implementation of RepositoryInterface.
 * Wraps a TypeORM Repository with transaction-aware operations.
 */
export class TypeOrmRepository<
  Entity extends PlainLiteralObject,
> extends RepositoryAdapter<Entity> {
  readonly metadata: RepositoryMetadataInterface<Entity>;

  constructor(
    private readonly repo: Repository<Entity>,
    private readonly options: TypeOrmRepositoryOptions,
  ) {
    super(options.entityKey, options.hookResolver);

    const entityName = repo.metadata?.name || repo.metadata?.targetName;

    if (!entityName) {
      throw new TypeOrmEntityNameException();
    }

    const entityType = buildEntity(repo.target, entityName);
    const columns = buildColumns<Entity>(repo.metadata.columns);
    const relations = repo.metadata.relations
      ? buildRelations(repo.metadata.relations, options.relationsConfig)
      : [];

    this.metadata = {
      name: entityName,
      type: entityType,
      columns,
      relations,
    };
  }

  /**
   * Get the repository, using transactional EntityManager if available.
   * Creates the driver transaction lazily on first access via `getOrStart()`.
   */
  protected async getRepo(ctx?: AppContextLike): Promise<Repository<Entity>> {
    if (this.options.transactionKey) {
      const context = AppContextHost.from(ctx);
      if (context.supports(TrxCtx)) {
        const { trx } = context.with(TrxCtx);
        if (trx?.isSupported) {
          const tx = await trx.getOrStart(this.options.transactionKey);
          return tx
            .getClient<EntityManager>()
            .getRepository(this.metadata.type);
        }
      }
    }
    return this.repo;
  }

  /**
   * Mark the transaction as dirty (write operation occurred)
   */
  protected markDirty(ctx?: AppContextLike): void {
    if (!this.options.transactionKey) return;

    const context = AppContextHost.from(ctx);
    if (!context.supports(TrxCtx)) return;

    const { trx } = context.with(TrxCtx);
    if (!trx?.isSupported) return;

    const tx = trx.get(this.options.transactionKey);
    tx?.markDirty();
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
   * with TypeORM And(). Relation-tagged conditions are nested
   * under their relation key.
   */
  protected branchToFindOptionsWhere(
    leaves: WhereClause[],
  ): FindOptionsWhere<Entity> {
    const fields: Record<string, FindOperator<unknown>> = {};
    const relations: Record<string, Record<string, FindOperator<unknown>>> = {};

    for (const leaf of leaves) {
      if (!isWhereCondition(leaf)) continue;

      const op = this.toFindOperator(leaf);

      if (leaf.relation) {
        const nested = (relations[leaf.relation] ??= {});
        nested[leaf.field] = nested[leaf.field]
          ? And(nested[leaf.field], op)
          : op;
      } else {
        const existing = fields[leaf.field];
        fields[leaf.field] = existing ? And(existing, op) : op;
      }
    }

    return Object.assign<
      FindOptionsWhere<Entity>,
      Record<string, FindOperator<unknown>>,
      Record<string, Record<string, FindOperator<unknown>>>
    >({}, fields, relations);
  }

  /**
   * Map a WhereCondition to a TypeORM FindOperator.
   */
  protected toFindOperator(cond: WhereCondition): FindOperator<unknown> {
    const { operator } = cond;
    switch (operator) {
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
      default: {
        const _exhaustive: never = operator;
        void _exhaustive;
        throw new RuntimeException({
          message: 'Unknown where operator "%s"',
          messageParams: [operator],
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JoinClause → TypeORM relations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Translate JoinClause[] into TypeORM FindOptionsRelations.
   */
  protected translateJoin(
    join?: JoinClause[],
  ): FindOptionsRelations<Entity> | undefined {
    if (!join?.length) return undefined;
    const relations: Record<string, boolean> = {};
    for (const j of join) {
      relations[j.relation] = true;
    }
    return Object.assign<FindOptionsRelations<Entity>, Record<string, boolean>>(
      {},
      relations,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Internal: build native TypeORM FindOptions from our options
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Convert RepositoryFindOptions to TypeORM FindManyOptions.
   */
  protected buildNativeFindManyOptions(
    options: RepositoryFindOptions<Entity>,
  ): FindManyOptions<Entity> {
    return {
      ...this.buildNativeFindBaseOptions(options),
      skip: options.skip,
      take: options.take,
    };
  }

  /**
   * Convert RepositoryFindOneOptions to TypeORM FindOneOptions.
   */
  protected buildNativeFindOneOptions(
    options: RepositoryFindOneOptions<Entity>,
  ): FindOneOptions<Entity> {
    return this.buildNativeFindBaseOptions(options);
  }

  private buildNativeFindBaseOptions(
    options: RepositoryFindOneOptions<Entity>,
  ): FindOneOptions<Entity> {
    const resolvedJoin = this.resolveJoinClauses(options.join);
    const where = this.translateWhere(options.where);
    const relations = this.translateJoin(resolvedJoin);
    const order = buildOrder<Entity>(options.order ?? []);
    return {
      select: options.select,
      where,
      relations,
      order,
      withDeleted: options.withDeleted,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Query operations
  // ═══════════════════════════════════════════════════════════════════════════

  protected async doFind(
    options: RepositoryFindOptions<Entity> = {},
  ): Promise<Entity[]> {
    const repo = await this.getRepo(options.ctx);
    return repo.find(this.buildNativeFindManyOptions(options));
  }

  protected async doFindOne(
    options: RepositoryFindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const repo = await this.getRepo(options.ctx);
    return repo.findOne(this.buildNativeFindOneOptions(options));
  }

  protected async doCount(
    options: RepositoryFindOptions<Entity> = {},
  ): Promise<number> {
    const repo = await this.getRepo(options.ctx);
    return repo.count(this.buildNativeFindManyOptions(options));
  }

  protected async doFindAndCount(
    options: RepositoryFindOptions<Entity> = {},
  ): Promise<[Entity[], number]> {
    const repo = await this.getRepo(options.ctx);
    return repo.findAndCount(this.buildNativeFindManyOptions(options));
  }

  // Create operations

  protected async doCreate(
    entity: DeepPartial<Entity>,
    options?: RepositoryCreateOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.save(entity);
  }

  protected async doCreateMany(
    entities: DeepPartial<Entity>[],
    options?: RepositoryCreateOptions,
  ): Promise<Entity[]> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.save(entities);
  }

  // Update operations

  protected async doUpdate(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    const merged = repo.merge(entity, data);
    return repo.save(merged);
  }

  protected async doUpsert(
    entity: DeepPartial<Entity>,
    options?: RepositoryUpsertOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    const conflictPaths = this.getPrimaryColumns();
    const insertResult = await repo.upsert(entity, conflictPaths);

    const identifiers = insertResult.identifiers[0] ?? {};
    const primaryKeys: Partial<Record<keyof Entity, Entity[keyof Entity]>> = {};

    for (const col of conflictPaths) {
      const value = identifiers[col] ?? entity[col];

      if (value === undefined) {
        throw new Error(`Upsert requires primary key "${col}" to be set`);
      }

      primaryKeys[col] = value;
    }

    const result = await repo.findOne({ where: primaryKeys });

    if (!result) {
      throw new Error('Upsert failed: entity not found after upsert');
    }

    return result;
  }

  protected async doReplace(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    const replaced = repo.merge(entity, data);
    return repo.save(replaced);
  }

  // Delete operations

  protected async doDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.remove(entity);
  }

  protected async doDeleteMany(
    entities: Entity[],
    options?: RepositoryDeleteOptions,
  ): Promise<Entity[]> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.remove(entities);
  }

  protected async doSoftDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.softRemove(entity);
  }

  protected async doRestore(
    entity: Entity,
    options?: RepositoryRestoreOptions,
  ): Promise<Entity> {
    const repo = await this.getRepo(options?.ctx);
    this.markDirty(options?.ctx);
    return repo.recover(entity);
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
