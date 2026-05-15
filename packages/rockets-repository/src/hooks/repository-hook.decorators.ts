import {
  SpecificationInterface,
  createHookMethodDecorator,
  Hook,
  HookTypeInterface,
} from '@concepta/rockets-app';

/**
 * Repository hook method keys.
 * Used with createHookMethodDecorator to create type-safe hook decorators.
 */
export const RepoHookMethodKey = {
  // High-level semantic keys
  BEFORE_READ: 'beforeRead',
  AFTER_READ: 'afterRead',
  BEFORE_WRITE: 'beforeWrite',
  AFTER_WRITE: 'afterWrite',
  BEFORE_TRANSITION: 'beforeTransition',
  AFTER_TRANSITION: 'afterTransition',
  BEFORE_DESTROY: 'beforeDestroy',
  AFTER_DESTROY: 'afterDestroy',

  // Fine-grained method keys
  BEFORE_FIND: 'beforeFind',
  AFTER_FIND: 'afterFind',
  BEFORE_FIND_ONE: 'beforeFindOne',
  AFTER_FIND_ONE: 'afterFindOne',
  BEFORE_COUNT: 'beforeCount',
  AFTER_COUNT: 'afterCount',
  BEFORE_FIND_AND_COUNT: 'beforeFindAndCount',
  AFTER_FIND_AND_COUNT: 'afterFindAndCount',
  BEFORE_CREATE: 'beforeCreate',
  AFTER_CREATE: 'afterCreate',
  BEFORE_CREATE_MANY: 'beforeCreateMany',
  AFTER_CREATE_MANY: 'afterCreateMany',
  BEFORE_UPDATE: 'beforeUpdate',
  AFTER_UPDATE: 'afterUpdate',
  BEFORE_UPSERT: 'beforeUpsert',
  AFTER_UPSERT: 'afterUpsert',
  BEFORE_REPLACE: 'beforeReplace',
  AFTER_REPLACE: 'afterReplace',
  BEFORE_DELETE: 'beforeDelete',
  AFTER_DELETE: 'afterDelete',
  BEFORE_DELETE_MANY: 'beforeDeleteMany',
  AFTER_DELETE_MANY: 'afterDeleteMany',
  BEFORE_SOFT_DELETE: 'beforeSoftDelete',
  AFTER_SOFT_DELETE: 'afterSoftDelete',
  BEFORE_RESTORE: 'beforeRestore',
  AFTER_RESTORE: 'afterRestore',
} as const;

// =============================================================================
// Repository Hook Type Decorator
// =============================================================================

/**
 * Marks a class as a repository hook.
 *
 * @param spec - Optional specification for when this hook applies
 *
 * @example
 * ```typescript
 * @RepoHook()
 * export class TenantHook {
 *   @BeforeFind()
 *   addTenantFilter(options, ctx) { ... }
 * }
 *
 * @RepoHook(Spec.entity('User'))
 * export class UserOnlyHook {
 *   @AfterCreate()
 *   notifyUserCreated(result, ctx) { ... }
 * }
 * ```
 */
export function RepoHook(spec?: SpecificationInterface): ClassDecorator {
  return Hook({ type: RepoHook, spec });
}

RepoHook.KEY = 'RepositoryHook';
Object.freeze(RepoHook);

// Type assertion for HookTypeInterface
export const RepoHookType: HookTypeInterface = RepoHook;

// =============================================================================
// High-Level Semantic Decorators (catch-all)
// =============================================================================

/**
 * Runs before any read operation (find, findOne, count, findAndCount).
 */
export const BeforeRead = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_READ,
);

/**
 * Runs after any read operation (find, findOne, count, findAndCount).
 */
export const AfterRead = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_READ,
);

/**
 * Runs before any write operation (create, createMany, update, upsert, replace).
 */
export const BeforeWrite = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_WRITE,
);

/**
 * Runs after any write operation (create, createMany, update, upsert, replace).
 */
export const AfterWrite = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_WRITE,
);

/**
 * Runs before any lifecycle transition (softRemove, restore).
 */
export const BeforeTransition = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_TRANSITION,
);

/**
 * Runs after any lifecycle transition (softRemove, restore).
 */
export const AfterTransition = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_TRANSITION,
);

/**
 * Runs before any destroy operation (remove - hard delete).
 */
export const BeforeDestroy = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_DESTROY,
);

/**
 * Runs after any destroy operation (remove - hard delete).
 */
export const AfterDestroy = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_DESTROY,
);

// =============================================================================
// Fine-Grained Method Decorators - Query
// =============================================================================

/**
 * Runs before find() - query for multiple entities.
 */
export const BeforeFind = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_FIND,
);

/**
 * Runs after find() - query for multiple entities.
 */
export const AfterFind = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_FIND,
);

/**
 * Runs before findOne() - query for a single entity.
 */
export const BeforeFindOne = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_FIND_ONE,
);

/**
 * Runs after findOne() - query for a single entity.
 */
export const AfterFindOne = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_FIND_ONE,
);

/**
 * Runs before count() - count entities.
 */
export const BeforeCount = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_COUNT,
);

/**
 * Runs after count() - count entities.
 */
export const AfterCount = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_COUNT,
);

/**
 * Runs before findAndCount() - query and count entities.
 */
export const BeforeFindAndCount = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_FIND_AND_COUNT,
);

/**
 * Runs after findAndCount() - query and count entities.
 */
export const AfterFindAndCount = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_FIND_AND_COUNT,
);

// =============================================================================
// Fine-Grained Method Decorators - Create
// =============================================================================

/**
 * Runs before create() - create a single entity.
 */
export const BeforeCreate = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_CREATE,
);

/**
 * Runs after create() - create a single entity.
 */
export const AfterCreate = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_CREATE,
);

/**
 * Runs before createMany() - create multiple entities.
 */
export const BeforeCreateMany = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_CREATE_MANY,
);

/**
 * Runs after createMany() - create multiple entities.
 */
export const AfterCreateMany = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_CREATE_MANY,
);

// =============================================================================
// Fine-Grained Method Decorators - Update
// =============================================================================

/**
 * Runs before update() - update an existing entity.
 */
export const BeforeUpdate = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_UPDATE,
);

/**
 * Runs after update() - update an existing entity.
 */
export const AfterUpdate = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_UPDATE,
);

/**
 * Runs before upsert() - create or update an entity.
 */
export const BeforeUpsert = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_UPSERT,
);

/**
 * Runs after upsert() - create or update an entity.
 */
export const AfterUpsert = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_UPSERT,
);

/**
 * Runs before replace() - fully replace an existing entity.
 */
export const BeforeReplace = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_REPLACE,
);

/**
 * Runs after replace() - fully replace an existing entity.
 */
export const AfterReplace = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_REPLACE,
);

// =============================================================================
// Fine-Grained Method Decorators - Delete (hard delete)
// =============================================================================

/**
 * Runs before delete() - permanently delete an entity.
 */
export const BeforeDelete = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_DELETE,
);

/**
 * Runs after delete() - permanently delete an entity.
 */
export const AfterDelete = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_DELETE,
);

/**
 * Runs before deleteMany() - permanently delete multiple entities.
 */
export const BeforeDeleteMany = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_DELETE_MANY,
);

/**
 * Runs after deleteMany() - permanently delete multiple entities.
 */
export const AfterDeleteMany = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_DELETE_MANY,
);

// =============================================================================
// Fine-Grained Method Decorators - Lifecycle (soft delete/restore)
// =============================================================================

/**
 * Runs before softDelete() - soft delete an entity.
 */
export const BeforeSoftDelete = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_SOFT_DELETE,
);

/**
 * Runs after softDelete() - soft delete an entity.
 */
export const AfterSoftDelete = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_SOFT_DELETE,
);

/**
 * Runs before restore() - restore a soft-deleted entity.
 */
export const BeforeRestore = createHookMethodDecorator(
  RepoHookMethodKey.BEFORE_RESTORE,
);

/**
 * Runs after restore() - restore a soft-deleted entity.
 */
export const AfterRestore = createHookMethodDecorator(
  RepoHookMethodKey.AFTER_RESTORE,
);
