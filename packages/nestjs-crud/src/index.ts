// the module
export { CrudModule } from './crud.module';

// interfaces
export { CrudContextInterface } from './infrastructure/interceptors/interfaces/crud-context.interface';
export { CrudParsedQueryInterface } from './infrastructure/request/interfaces/crud-parsed-query.interface';
export { CrudResponsePaginatedInterface } from './infrastructure/dtos/interfaces/crud-response-paginated.interface';
export { CrudResponseMetrics } from './infrastructure/dtos/interfaces/crud-response-metrics.interface';
export { CrudCreateBatchInterface } from './infrastructure/dtos/interfaces/crud-create-batch.interface';
export { CrudModuleForFeatureOptionsInterface } from './infrastructure/config/interfaces/crud-module-for-feature-options.interface';
export {
  CrudControllerClassOptionsInterface,
  CrudControllerOptionsInterface,
} from './infrastructure/interfaces/crud-controller-options.interface';

export { CrudAdapter } from './infrastructure/adapters/crud.adapter';

// types
export { CrudAdapterProvider } from './infrastructure/adapters/interfaces/crud-adapter.types';

// utility decorators
export { InjectCrudAdapter } from './infrastructure/decorators/util/inject-crud-adapter.decorator';

// controller decorators
export { CrudController } from './infrastructure/decorators/controller/crud-controller.decorator';

// route decorators
export { CrudList } from './infrastructure/decorators/operations/crud-list.decorator';
export { CrudRead } from './infrastructure/decorators/operations/crud-read.decorator';
export { CrudCreate } from './infrastructure/decorators/operations/crud-create.decorator';
export { CrudCreateBatch } from './infrastructure/decorators/operations/crud-create-batch.decorator';
export { CrudUpdate } from './infrastructure/decorators/operations/crud-update.decorator';
export { CrudReplace } from './infrastructure/decorators/operations/crud-replace.decorator';
export { CrudDelete } from './infrastructure/decorators/operations/crud-delete.decorator';
export { CrudSoftDelete } from './infrastructure/decorators/operations/crud-soft-delete.decorator';
export { CrudRestore } from './infrastructure/decorators/operations/crud-restore.decorator';

// route option decorators
export { CrudAllow } from './infrastructure/decorators/routes/crud-allow.decorator';
export { CrudCache } from './infrastructure/decorators/routes/crud-cache.decorator';
export { CrudCommand } from './infrastructure/decorators/routes/crud-command.decorator';
export { CrudCommandHandler } from './infrastructure/decorators/routes/crud-command-handler.decorator';
export { CrudExclude } from './infrastructure/decorators/routes/crud-exclude.decorator';
export { CrudFilter } from './infrastructure/decorators/routes/crud-filter.decorator';
export { CrudJoin } from './infrastructure/decorators/routes/crud-join.decorator';
export { CrudLimit } from './infrastructure/decorators/routes/crud-limit.decorator';
export { CrudMaxLimit } from './infrastructure/decorators/routes/crud-max-limit.decorator';
export { CrudEntity } from './infrastructure/decorators/routes/crud-entity.decorator';
export { CrudName } from './infrastructure/decorators/routes/crud-name.decorator';
export { CrudParams } from './infrastructure/decorators/routes/crud-params.decorator';
export { CrudPersist } from './infrastructure/decorators/routes/crud-persist.decorator';
export { CrudQuery } from './infrastructure/decorators/routes/crud-query.decorator';
export { CrudQueryHandler } from './infrastructure/decorators/routes/crud-query-handler.decorator';
export { CrudRequestBody } from './infrastructure/decorators/routes/crud-request-body.decorator';
export { CrudRequestBodyBatch } from './infrastructure/decorators/routes/crud-request-body-batch.decorator';
export { CrudResponseResource } from './infrastructure/decorators/routes/crud-response-resource.decorator';
export { CrudResponsePaginated } from './infrastructure/decorators/routes/crud-response-paginated.decorator';
export { CrudReturnDeleted } from './infrastructure/decorators/routes/crud-return-deleted.decorator';
export { CrudReturnRestored } from './infrastructure/decorators/routes/crud-return-restored.decorator';
export { CrudSerialize } from './infrastructure/decorators/routes/crud-serialize.decorator';
export { CrudSort } from './infrastructure/decorators/routes/crud-sort.decorator';
export { CrudValidate } from './infrastructure/decorators/routes/crud-validate.decorator';
// interceptors
export {
  CrudContextOverlay,
  CrudCtx,
} from './infrastructure/interceptors/crud-context.overlay';

// param decorators
export { CrudBody } from './infrastructure/decorators/params/crud-body.decorator';

// api decorators
export { CrudApiBody } from './infrastructure/decorators/openapi/crud-api-body.decorator';
export { CrudApiOperation } from './infrastructure/decorators/openapi/crud-api-operation.decorator';
export { CrudApiParam } from './infrastructure/decorators/openapi/crud-api-param.decorator';
export { CrudApiQuery } from './infrastructure/decorators/openapi/crud-api-query.decorator';
export { CrudApiResponse } from './infrastructure/decorators/openapi/crud-api-response.decorator';

// dto
export { CrudResponsePaginatedDto } from './infrastructure/dtos/crud-response-paginated.dto';
export { CrudCreateBatchDto } from './infrastructure/dtos/crud-create-batch.dto';

// exceptions
export { CrudException } from './infrastructure/exceptions/crud.exception';
export { CrudContextException } from './infrastructure/exceptions/crud-context.exception';
export { CrudDecoratorException } from './infrastructure/exceptions/crud-decorator.exception';
export { CrudQueryException } from './infrastructure/exceptions/crud-query.exception';

// configurable crud builder
export {
  ConfigurableCrudClassesMap,
  ConfigurableCrudHost,
} from './infrastructure/utils/interfaces/configurable-crud-host.interface';
export {
  ConfigurableCrudClassOptions,
  ConfigurableCrudHybridOptions,
  ConfigurableCrudGeneratedOptions,
  ConfigurableCrudOptions,
} from './infrastructure/utils/interfaces/configurable-crud-options.interface';
export { ConfigurableCrudBuilder } from './infrastructure/utils/configurable-crud.builder';
export { ConfigurableCrudOptionsTransformer } from './crud.types';

// operation types
export { CrudOperationOptions } from './infrastructure/utils/crud-operation-options.type';
export { Operation } from '@concepta/rockets-app';

// specifications
export { CrudSpecContextInterface } from './infrastructure/specifications/interfaces/crud-spec-context.interface';
export { CrudSpec } from './infrastructure/specifications/crud-spec.factory';
export { OperationSpecification } from './infrastructure/specifications/operation.specification';
export { ActionSpecification } from './infrastructure/specifications/action.specification';

// resolvers
export { CrudResolverInterface } from './infrastructure/resolvers/interfaces/crud-resolver.interface';
export { CrudAdapterResolver } from './infrastructure/resolvers/crud-adapter.resolver';
export { CrudOperationResolver } from './infrastructure/resolvers/crud-operation.resolver';
export { CrudCqrsResolver } from './infrastructure/resolvers/crud-cqrs.resolver';
export { CrudResolver } from './infrastructure/decorators/routes/crud-resolver.decorator';

// operations (queries/commands)
export { CrudListQuery } from './application/queries/impl/crud-list.query';
export { CrudReadQuery } from './application/queries/impl/crud-read.query';
export { CrudCreateCommand } from './application/commands/impl/crud-create.command';
export { CrudCreateBatchCommand } from './application/commands/impl/crud-create-batch.command';
export { CrudUpdateCommand } from './application/commands/impl/crud-update.command';
export { CrudReplaceCommand } from './application/commands/impl/crud-replace.command';
export { CrudDeleteCommand } from './application/commands/impl/crud-delete.command';
export { CrudSoftDeleteCommand } from './application/commands/impl/crud-soft-delete.command';
export { CrudRestoreCommand } from './application/commands/impl/crud-restore.command';
export { CrudWithBodyCommand } from './application/commands/impl/crud-with-body.command';

// operations (handlers)
export { CrudListHandler } from './application/queries/handlers/crud-list.handler';
export { CrudReadHandler } from './application/queries/handlers/crud-read.handler';
export { CrudCreateHandler } from './application/commands/handlers/crud-create.handler';
export { CrudCreateBatchHandler } from './application/commands/handlers/crud-create-batch.handler';
export { CrudUpdateHandler } from './application/commands/handlers/crud-update.handler';
export { CrudReplaceHandler } from './application/commands/handlers/crud-replace.handler';
export { CrudDeleteHandler } from './application/commands/handlers/crud-delete.handler';
export { CrudSoftDeleteHandler } from './application/commands/handlers/crud-soft-delete.handler';
export { CrudRestoreHandler } from './application/commands/handlers/crud-restore.handler';
