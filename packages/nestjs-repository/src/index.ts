// ═══════════════════════════════════════════════════════════════════
// Module
// ═══════════════════════════════════════════════════════════════════
export { RepositoryModule } from './repository.module';

// ═══════════════════════════════════════════════════════════════════
// Repository Adapter
// ═══════════════════════════════════════════════════════════════════
export { RepositoryAdapter } from './repository/repository-adapter';

// ═══════════════════════════════════════════════════════════════════
// Repository Implementation Interfaces
// ═══════════════════════════════════════════════════════════════════
export {
  RelationActionConfig,
  RepositoryProviderOptions,
} from './interfaces/repository-provider-options.interface';
export {
  RepositoryModuleInterface,
  DynamicRepositoryModule,
} from './interfaces/repository-module.interface';

// ═══════════════════════════════════════════════════════════════════
// Exceptions
// ═══════════════════════════════════════════════════════════════════
export { RepositoryDuplicateKeyException } from './exceptions/repository-duplicate-key.exception';
export { RepositoryQueryException } from './exceptions/repository-query.exception';
export { FederationException } from './federation/exceptions/federation.exception';
export { TransactionRequiredException } from './exceptions/transaction-required.exception';
export { TransactionTimeoutException } from './exceptions/transaction-timeout.exception';

// ═══════════════════════════════════════════════════════════════════
// Transaction
// ═══════════════════════════════════════════════════════════════════
export { TransactionFactoryInterface } from './interfaces/transaction-factory.interface';
export { TransactionManager } from './transaction/transaction-manager';
export { TransactionScope } from './transaction/transaction-scope';
export { RepoCtx } from './context/interfaces/repository-context.interface';
export { TrxCtx } from './transaction/interfaces/transaction-context.interface';
export { TransactionalRunner } from './transaction/transactional-runner';
export {
  Transactional,
  TransactionalOptions,
} from './transaction/transactional.decorator';
export { TransactionInterceptor } from './interceptors/transaction.interceptor';

// ═══════════════════════════════════════════════════════════════════
// Permeators
// ═══════════════════════════════════════════════════════════════════
export { RepoPermeatorFactory } from './hooks/repo-permeator-factory';

// ═══════════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════════

// Hook method types
export {
  // Read operations
  BeforeFindMethod,
  AfterFindMethod,
  BeforeFindOneMethod,
  AfterFindOneMethod,
  BeforeCountMethod,
  AfterCountMethod,
  BeforeFindAndCountMethod,
  AfterFindAndCountMethod,
  // Create operations
  BeforeCreateMethod,
  AfterCreateMethod,
  BeforeCreateManyMethod,
  AfterCreateManyMethod,
  // Update operations
  BeforeUpdateMethod,
  AfterUpdateMethod,
  BeforeUpsertMethod,
  AfterUpsertMethod,
  BeforeReplaceMethod,
  AfterReplaceMethod,
  // Delete operations
  BeforeDeleteMethod,
  AfterDeleteMethod,
  // Lifecycle operations
  BeforeSoftDeleteMethod,
  AfterSoftDeleteMethod,
  BeforeRestoreMethod,
  AfterRestoreMethod,
  // High-level semantic operations
  BeforeReadMethod,
  AfterReadMethod,
  BeforeWriteMethod,
  AfterWriteMethod,
  BeforeTransitionMethod,
  AfterTransitionMethod,
  BeforeDestroyMethod,
  AfterDestroyMethod,
} from './hooks/hook-method.types';

// Hook decorators
export {
  // Repository hook method keys
  RepoHookMethodKey,
  // Repository hook type decorator
  RepoHook,
  // High-level semantic decorators
  BeforeRead,
  AfterRead,
  BeforeWrite,
  AfterWrite,
  BeforeTransition,
  AfterTransition,
  BeforeDestroy,
  AfterDestroy,
  // Fine-grained query decorators
  BeforeFind,
  AfterFind,
  BeforeFindOne,
  AfterFindOne,
  BeforeCount,
  AfterCount,
  BeforeFindAndCount,
  AfterFindAndCount,
  // Fine-grained create decorators
  BeforeCreate,
  AfterCreate,
  BeforeCreateMany,
  AfterCreateMany,
  // Fine-grained update decorators
  BeforeUpdate,
  AfterUpdate,
  BeforeUpsert,
  AfterUpsert,
  BeforeReplace,
  AfterReplace,
  // Fine-grained delete decorators
  BeforeDelete,
  AfterDelete,
  // Fine-grained lifecycle decorators
  BeforeSoftDelete,
  AfterSoftDelete,
  BeforeRestore,
  AfterRestore,
} from './hooks/repository-hook.decorators';

// Hook specifications
export { RepoSpec } from './hooks/specifications/repo-spec.factory';
export { EntitySpecification } from './hooks/specifications/entity.specification';

// Repository interfaces
export { RepositoryInterface } from './repository/interfaces/repository.interface';
export { RepositoryEntityOptionInterface } from './repository/interfaces/repository-entity-option.interface';
export { RepositoryColumnMetadataInterface } from './repository/interfaces/repository-column-metadata.interface';
export { RepositoryMetadataInterface } from './repository/interfaces/repository-metadata.interface';
export { RepositoryRelationMetadataInterface } from './repository/interfaces/repository-relation-metadata.interface';

// Repository option types
export {
  RepositoryFindOneOptions,
  RepositoryFindOptions,
  RepositoryCreateOptions,
  RepositoryUpdateOptions,
  RepositoryUpsertOptions,
  RepositoryDeleteOptions,
  RepositoryRestoreOptions,
} from './repository/interfaces/repository-options.interface';

// Repository query types
export {
  EntityColumn,
  WhereOperator,
  WhereNullaryOperator,
  WhereScalarOperator,
  WhereArrayOperator,
  WherePairOperator,
  WhereCompoundOperator,
  WhereConditionArr,
  RelationAction,
  SortOrder,
  OrderSortKey,
  OrderSortKeyArr,
  OrderClause,
} from './repository/repository.types';

// Order sort key interfaces
export {
  OrderSortKeyAsc,
  OrderSortKeyDesc,
} from './repository/interfaces/order-sort-key.interface';

// Join clause interface
export { JoinClause } from './repository/interfaces/join-clause.interface';

// Where clause interfaces
export {
  WhereConditionNullary,
  WhereConditionScalar,
  WhereConditionArray,
  WhereConditionPair,
  WhereCondition,
  WhereCompound,
  WhereClause,
  isWhereCondition,
  isWhereCompound,
  isNullaryCondition,
  isArrayCondition,
  isPairCondition,
} from './repository/interfaces/where-clause.interface';

// Where clause helpers
export { Where } from './repository/where.helpers';

// Order clause helpers
export { OrderBy } from './repository/order-by.helpers';

// Join clause helpers
export { Join } from './repository/join.helpers';

// Repository utils
export { getDynamicRepositoryToken } from './utils/get-dynamic-repository-token';

// Repository decorators
export { InjectDynamicRepository } from './decorators/inject-dynamic-repository.decorator';

// Transaction interfaces
export { TransactionInterface } from './transaction/interfaces/transaction.interface';

// Context interfaces
export { TransactionContextInterface } from './transaction/interfaces/transaction-context.interface';
