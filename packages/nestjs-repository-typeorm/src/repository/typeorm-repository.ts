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
  FindOptionsOrder,
  FindOneOptions,
} from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import {
  DeepPartial,
  JoinClause,
  RepositoryContextInterface,
  RepositoryMetadataInterface,
  RepositoryFindOptions,
  RepositoryFindOneOptions,
  RepositoryCreateOptions,
  RepositoryUpdateOptions,
  RepositoryUpsertOptions,
  RepositoryDeleteOptions,
  RepositoryOrderOptions,
  RepositoryRestoreOptions,
  RuntimeException,
  WhereClause,
  WhereCondition,
  WhereOperator,
  isWhereCondition,
} from '@concepta/nestjs-common';
import { HookResolverService } from '@concepta/nestjs-hook';
import {
  RelationActionConfig,
  RepositoryAdapter,
} from '@concepta/nestjs-repository';

import { TypeOrmEntityNameException } from '../exceptions/typeorm-entity-name.exception';

import {
  buildEntity,
  buildColumns,
  buildRelations,
} from './typeorm-options.schema';

/**
 * Options for constructing a TypeOrmRepository.
 */
export interface TypeOrmRepositoryOptions {
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
    private readonly options: TypeOrmRepositoryOptions = {},
  ) {
    super(options.hookResolver);

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
  protected async getRepo(
    ctx?: RepositoryContextInterface,
  ): Promise<Repository<Entity>> {
    if (this.options.transactionKey && ctx?.trx) {
      const tx = await ctx.trx.getOrStart(this.options.transactionKey);
      return tx.getClient<EntityManager>().getRepository(this.metadata.type);
    }
    return this.repo;
  }

  /**
   * Mark the transaction as dirty (write operation occurred)
   */
  protected markDirty(ctx?: RepositoryContextInterface): void {
    if (this.options.transactionKey) {
      ctx?.trx?.get(this.options.transactionKey)?.markDirty();
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
    const order = options.order
      ? Object.assign<FindOptionsOrder<Entity>, RepositoryOrderOptions<Entity>>(
          {},
          options.order,
        )
      : undefined;
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

  async find(options: RepositoryFindOptions<Entity> = {}): Promise<Entity[]> {
    return this.permeator.find.permeate(
      options,
      async (scoped) => {
        const repo = await this.getRepo(options.ctx);
        return repo.find(this.buildNativeFindManyOptions(scoped));
      },
      options.ctx,
    );
  }

  async findOne(
    options: RepositoryFindOneOptions<Entity>,
  ): Promise<Entity | null> {
    return this.permeator.findOne.permeate(
      options,
      async (scoped) => {
        const repo = await this.getRepo(options.ctx);
        return repo.findOne(this.buildNativeFindOneOptions(scoped));
      },
      options.ctx,
    );
  }

  async count(options: RepositoryFindOptions<Entity> = {}): Promise<number> {
    return this.permeator.count.permeate(
      options,
      async (scoped) => {
        const repo = await this.getRepo(options.ctx);
        return repo.count(this.buildNativeFindManyOptions(scoped));
      },
      options.ctx,
    );
  }

  async findAndCount(
    options: RepositoryFindOptions<Entity> = {},
  ): Promise<[Entity[], number]> {
    return this.permeator.findAndCount.permeate(
      options,
      async (scoped) => {
        const repo = await this.getRepo(options.ctx);
        return repo.findAndCount(this.buildNativeFindManyOptions(scoped));
      },
      options.ctx,
    );
  }

  // Create operations

  async create(
    entity: DeepPartial<Entity>,
    options?: RepositoryCreateOptions,
  ): Promise<Entity> {
    return this.permeator.create.permeate(
      entity,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        return repo.save(scoped);
      },
      options?.ctx,
    );
  }

  async createMany(
    entities: DeepPartial<Entity>[],
    options?: RepositoryCreateOptions,
  ): Promise<Entity[]> {
    return this.permeator.createMany.permeate(
      entities,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        return repo.save(scoped);
      },
      options?.ctx,
    );
  }

  // Update operations

  async update(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    return this.permeator.update.permeate(
      data,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        const merged = repo.merge(entity, scoped);
        return repo.save(merged);
      },
      options?.ctx,
    );
  }

  async upsert(
    entity: DeepPartial<Entity>,
    options?: RepositoryUpsertOptions,
  ): Promise<Entity> {
    return this.permeator.upsert.permeate(
      entity,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        const conflictPaths = this.getPrimaryColumns();
        const insertResult = await repo.upsert(scoped, conflictPaths);

        const identifiers = insertResult.identifiers[0] ?? {};
        const primaryKeys: Partial<Record<keyof Entity, Entity[keyof Entity]>> =
          {};

        for (const col of conflictPaths) {
          const value = identifiers[col] ?? scoped[col];

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
      },
      options?.ctx,
    );
  }

  async replace(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    return this.permeator.replace.permeate(
      data,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        const replaced = repo.merge(entity, scoped);
        return repo.save(replaced);
      },
      options?.ctx,
    );
  }

  // Delete operations

  async delete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    return this.permeator.delete.permeate(
      entity,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        return repo.remove(scoped);
      },
      options?.ctx,
    );
  }

  async softDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    return this.permeator.softDelete.permeate(
      entity,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        return repo.softRemove(scoped);
      },
      options?.ctx,
    );
  }

  async restore(
    entity: Entity,
    options?: RepositoryRestoreOptions,
  ): Promise<Entity> {
    return this.permeator.restore.permeate(
      entity,
      async (scoped) => {
        const repo = await this.getRepo(options?.ctx);
        this.markDirty(options?.ctx);
        return repo.recover(scoped);
      },
      options?.ctx,
    );
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
