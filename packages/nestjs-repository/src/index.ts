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
export { RepositoryProviderOptions } from './interfaces/repository-provider-options.interface';
export {
  RepositoryModuleInterface,
  DynamicRepositoryModule,
} from './interfaces/repository-module.interface';

// ═══════════════════════════════════════════════════════════════════
// Exceptions
// ═══════════════════════════════════════════════════════════════════
export { RepositoryDuplicateKeyException } from './exceptions/repository-duplicate-key.exception';
export { TransactionRequiredException } from './exceptions/transaction-required.exception';
export { TransactionTimeoutException } from './exceptions/transaction-timeout.exception';

// ═══════════════════════════════════════════════════════════════════
// Transaction
// ═══════════════════════════════════════════════════════════════════
export { TransactionFactoryInterface } from './interfaces/transaction-factory.interface';
export { TransactionManager } from './transaction/transaction-manager';
export { TransactionScope } from './transaction/transaction-scope';
export { TransactionalRunner } from './transaction/transactional-runner';
export { Transactional } from './transaction/transactional.decorator';
export { TransactionInterceptor } from './interceptors/transaction.interceptor';

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
} from './hooks/types/hook-method.types';

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
} from './hooks/decorators/repository-hook.decorators';
