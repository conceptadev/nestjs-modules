import {
  Membrane,
  Permeator,
  IPermeator,
  PermeateCallback,
  PermeatorOptions,
} from '@tsyche/membrane';

import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial, HookMethodKeyType } from '@concepta/rockets-app';

import { RepositoryQueryException } from '../exceptions/repository-query.exception';
import {
  RepositoryFindOptions,
  RepositoryFindOneOptions,
} from '../repository/interfaces/repository-options.interface';

import { RepoHookMethodKey as K } from './repository-hook.decorators';

type RunHooksFn = <T>(
  methodKey: HookMethodKeyType,
  payload: T,
  ctx: PlainLiteralObject | undefined,
) => Promise<T>;

type Ctx = PlainLiteralObject;
type HookCb = PermeateCallback<unknown, Ctx>;

type RepoPermeator<TIn, TOut, TResult = TOut> = IPermeator<
  TIn,
  TOut,
  unknown,
  unknown,
  Ctx,
  TResult
>;

export class RepoPermeatorFactory<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  // Read operations (overwrite: hooks can freely transform)
  readonly find: RepoPermeator<RepositoryFindOptions<Entity>, Entity[]>;
  readonly findOne: RepoPermeator<
    RepositoryFindOneOptions<Entity>,
    Entity,
    Entity | null
  >;
  readonly count: RepoPermeator<RepositoryFindOptions<Entity>, number>;
  readonly findAndCount: RepoPermeator<
    RepositoryFindOptions<Entity>,
    [Entity[], number]
  >;

  // Write operations (preserve: original/DB result wins)
  readonly create: RepoPermeator<DeepPartial<Entity>, Entity>;
  readonly createMany: RepoPermeator<DeepPartial<Entity>[], Entity[]>;
  readonly update: RepoPermeator<DeepPartial<Entity>, Entity>;
  readonly upsert: RepoPermeator<DeepPartial<Entity>, Entity>;
  readonly replace: RepoPermeator<DeepPartial<Entity>, Entity>;

  // Delete/lifecycle operations
  readonly delete: RepoPermeator<Entity, Entity>;
  readonly deleteMany: RepoPermeator<Entity[], Entity[]>;
  readonly softDelete: RepoPermeator<Entity, Entity>;
  readonly restore: RepoPermeator<Entity, Entity>;

  constructor(runHooks: RunHooksFn, entityName: string) {
    const cb =
      (key: HookMethodKeyType): HookCb =>
      <T>(payload: T, ambient?: Ctx) =>
        runHooks(key, payload, ambient);

    const options: PermeatorOptions = {
      onError: (error: unknown): never => {
        if (error instanceof RepositoryQueryException) throw error;
        throw new RepositoryQueryException(entityName, {
          originalError: error,
        });
      },
    };

    // Read
    this.find = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_READ),
          'overwrite',
        ),
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_FIND),
          'overwrite',
        ),
      ),
      Membrane.sequence(
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_FIND), 'overwrite'),
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_READ), 'overwrite'),
      ),
      options,
    );

    this.findOne = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<RepositoryFindOneOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_READ),
          'overwrite',
        ),
        Membrane.object<RepositoryFindOneOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_FIND_ONE),
          'overwrite',
        ),
      ),
      Membrane.nullable(
        Membrane.sequence(
          Membrane.object<Entity, unknown, Ctx>(
            cb(K.AFTER_FIND_ONE),
            'overwrite',
          ),
          Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_READ), 'overwrite'),
        ),
      ),
      options,
    );

    this.count = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_READ),
          'overwrite',
        ),
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_COUNT),
          'overwrite',
        ),
      ),
      Membrane.scalar<number, number, Ctx>(cb(K.AFTER_COUNT)),
      options,
    );

    this.findAndCount = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_READ),
          'overwrite',
        ),
        Membrane.object<RepositoryFindOptions<Entity>, unknown, Ctx>(
          cb(K.BEFORE_FIND_AND_COUNT),
          'overwrite',
        ),
      ),
      Membrane.object<[Entity[], number], unknown, Ctx>(
        cb(K.AFTER_FIND_AND_COUNT),
        'overwrite',
      ),
      options,
    );

    // Write (preserve: original data wins)
    this.create = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_WRITE),
          'preserve',
        ),
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_CREATE),
          'preserve',
        ),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_CREATE), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_WRITE), 'preserve'),
      ),
      options,
    );

    this.createMany = Permeator.mutable(
      Membrane.sequence(
        Membrane.collection<DeepPartial<Entity>, Ctx>(
          cb(K.BEFORE_WRITE),
          'overwrite',
        ),
        Membrane.collection<DeepPartial<Entity>, Ctx>(
          cb(K.BEFORE_CREATE_MANY),
          'overwrite',
        ),
      ),
      Membrane.sequence(
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_CREATE_MANY), 'overwrite'),
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_WRITE), 'overwrite'),
      ),
      options,
    );

    this.update = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_WRITE),
          'preserve',
        ),
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_UPDATE),
          'preserve',
        ),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_UPDATE), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_WRITE), 'preserve'),
      ),
      options,
    );

    this.upsert = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_WRITE),
          'preserve',
        ),
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_UPSERT),
          'preserve',
        ),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_UPSERT), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_WRITE), 'preserve'),
      ),
      options,
    );

    this.replace = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_WRITE),
          'preserve',
        ),
        Membrane.object<DeepPartial<Entity>, unknown, Ctx>(
          cb(K.BEFORE_REPLACE),
          'preserve',
        ),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_REPLACE), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_WRITE), 'preserve'),
      ),
      options,
    );

    // Delete/lifecycle
    this.delete = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.BEFORE_DESTROY), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.BEFORE_DELETE), 'preserve'),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_DELETE), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_DESTROY), 'preserve'),
      ),
      options,
    );

    this.deleteMany = Permeator.mutable(
      Membrane.sequence(
        Membrane.collection<Entity, Ctx>(cb(K.BEFORE_DESTROY), 'preserve'),
        Membrane.collection<Entity, Ctx>(cb(K.BEFORE_DELETE_MANY), 'preserve'),
      ),
      Membrane.sequence(
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_DELETE_MANY), 'preserve'),
        Membrane.collection<Entity, Ctx>(cb(K.AFTER_DESTROY), 'preserve'),
      ),
      options,
    );

    this.softDelete = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.BEFORE_TRANSITION),
          'preserve',
        ),
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.BEFORE_SOFT_DELETE),
          'preserve',
        ),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.AFTER_SOFT_DELETE),
          'preserve',
        ),
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.AFTER_TRANSITION),
          'preserve',
        ),
      ),
      options,
    );

    this.restore = Permeator.mutable(
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.BEFORE_TRANSITION),
          'preserve',
        ),
        Membrane.object<Entity, unknown, Ctx>(cb(K.BEFORE_RESTORE), 'preserve'),
      ),
      Membrane.sequence(
        Membrane.object<Entity, unknown, Ctx>(cb(K.AFTER_RESTORE), 'preserve'),
        Membrane.object<Entity, unknown, Ctx>(
          cb(K.AFTER_TRANSITION),
          'preserve',
        ),
      ),
      options,
    );
  }
}
