// the module
export { CrudModule } from './crud.module';

// interfaces
export { CrudContextInterface } from './crud/interfaces/crud-context.interface';
export { CrudParsedQueryInterface } from './request/interfaces/crud-parsed-query.interface';
export { CrudFederationFetchOptionsInterface } from './services/interfaces/crud-federation-fetch-options.interface';
export { CrudResponsePaginatedInterface } from './crud/interfaces/crud-response-paginated.interface';
export { CrudResponseMetrics } from './crud/interfaces/crud-response-metrics.interface';
export { CrudCreateBatchInterface } from './crud/interfaces/crud-create-batch.interface';
export { CrudModuleForFeatureOptionsInterface } from './interfaces/crud-module-for-feature-options.interface';
export {
  CrudLocal,
  CrudLocalInterface,
} from './crud/interfaces/crud-local.interface';
export {
  CrudControllerClassOptionsInterface,
  CrudControllerOptionsInterface,
} from './crud/interfaces/crud-controller-options.interface';

export { CrudAdapter } from './crud/adapters/crud.adapter';

// types
export { CrudAdapterProvider } from './crud/interfaces/crud-adapter-provider.interface';

// utility decorators
export { InjectCrudAdapter } from './crud/decorators/util/inject-crud-adapter.decorator';

// controller decorators
export { CrudController } from './crud/decorators/controller/crud-controller.decorator';

// route decorators
export { CrudList } from './crud/decorators/operations/crud-list.decorator';
export { CrudRead } from './crud/decorators/operations/crud-read.decorator';
export { CrudCreate } from './crud/decorators/operations/crud-create.decorator';
export { CrudCreateBatch } from './crud/decorators/operations/crud-create-batch.decorator';
export { CrudUpdate } from './crud/decorators/operations/crud-update.decorator';
export { CrudReplace } from './crud/decorators/operations/crud-replace.decorator';
export { CrudDelete } from './crud/decorators/operations/crud-delete.decorator';
export { CrudSoftDelete } from './crud/decorators/operations/crud-soft-delete.decorator';
export { CrudRestore } from './crud/decorators/operations/crud-restore.decorator';

// route option decorators
export { CrudAllow } from './crud/decorators/routes/crud-allow.decorator';
export { CrudCache } from './crud/decorators/routes/crud-cache.decorator';
export { CrudCommand } from './crud/decorators/routes/crud-command.decorator';
export { CrudCommandHandler } from './crud/decorators/routes/crud-command-handler.decorator';
export { CrudExclude } from './crud/decorators/routes/crud-exclude.decorator';
export { CrudFilter } from './crud/decorators/routes/crud-filter.decorator';
export { CrudLimit } from './crud/decorators/routes/crud-limit.decorator';
export { CrudMaxLimit } from './crud/decorators/routes/crud-max-limit.decorator';
export { CrudEntity } from './crud/decorators/routes/crud-entity.decorator';
export { CrudName } from './crud/decorators/routes/crud-name.decorator';
export { CrudParams } from './crud/decorators/routes/crud-params.decorator';
export { CrudPersist } from './crud/decorators/routes/crud-persist.decorator';
export { CrudQuery } from './crud/decorators/routes/crud-query.decorator';
export { CrudQueryHandler } from './crud/decorators/routes/crud-query-handler.decorator';
export { CrudRelations } from './crud/decorators/routes/crud-relations.decorator';
export { CrudRequestBody } from './crud/decorators/routes/crud-request-body.decorator';
export { CrudRequestBodyBatch } from './crud/decorators/routes/crud-request-body-batch.decorator';
export { CrudResponseResource } from './crud/decorators/routes/crud-response-resource.decorator';
export { CrudResponsePaginated } from './crud/decorators/routes/crud-response-paginated.decorator';
export { CrudReturnDeleted } from './crud/decorators/routes/crud-return-deleted.decorator';
export { CrudReturnRestored } from './crud/decorators/routes/crud-return-restored.decorator';
export { CrudSerialize } from './crud/decorators/routes/crud-serialize.decorator';
export { CrudSort } from './crud/decorators/routes/crud-sort.decorator';
export { CrudValidate } from './crud/decorators/routes/crud-validate.decorator';
export { UseCrudLocals } from './crud/decorators/routes/crud-locals.decorator';

// param decorators
export { CrudBody } from './crud/decorators/params/crud-body.decorator';

// api decorators
export { CrudApiBody } from './crud/decorators/openapi/crud-api-body.decorator';
export { CrudApiOperation } from './crud/decorators/openapi/crud-api-operation.decorator';
export { CrudApiParam } from './crud/decorators/openapi/crud-api-param.decorator';
export { CrudApiQuery } from './crud/decorators/openapi/crud-api-query.decorator';
export { CrudApiResponse } from './crud/decorators/openapi/crud-api-response.decorator';

// classes
export { CrudFederationService } from './services/crud-federation.service';

// dto
export { CrudResponsePaginatedDto } from './crud/dto/crud-response-paginated.dto';
export { CrudCreateBatchDto } from './crud/dto/crud-create-batch.dto';

// exceptions
export { CrudException } from './exceptions/crud.exception';
export { CrudContextException } from './exceptions/crud-context.exception';
export { CrudDecoratorException } from './exceptions/crud-decorator.exception';
export { CrudFederationException } from './exceptions/crud-federation.exception';
export { CrudQueryException } from './exceptions/crud-query.exception';

// configurable crud builder
export {
  ConfigurableCrudClassesMap,
  ConfigurableCrudHost,
} from './util/interfaces/configurable-crud-host.interface';
export { ConfigurableCrudOptions } from './util/interfaces/configurable-crud-options.interface';
export { ConfigurableCrudBuilder } from './util/configurable-crud.builder';
export { ConfigurableCrudOptionsTransformer } from './crud.types';

// operation types
export { CrudOperationOptions } from './crud/types/crud-operation-options.type';
export { Operation } from '@concepta/nestjs-common';

// specifications
export { CrudSpec } from './crud/specifications/crud-spec.factory';
export { OperationSpecification } from './crud/specifications/operation.specification';
export { ActionSpecification } from './crud/specifications/action.specification';

// resolvers
export { CrudResolverInterface } from './crud/interfaces/crud-resolver.interface';
export { CrudAdapterResolver } from './crud/resolvers/crud-adapter.resolver';
export { CrudOperationResolver } from './crud/resolvers/crud-operation.resolver';
export { CrudCqrsResolver } from './crud/resolvers/crud-cqrs.resolver';
export { CrudResolver } from './crud/decorators/routes/crud-resolver.decorator';

// operations (queries/commands)
export { CrudListQuery } from './crud/operations/queries/crud-list.query';
export { CrudReadQuery } from './crud/operations/queries/crud-read.query';
export { CrudCreateCommand } from './crud/operations/commands/crud-create.command';
export { CrudCreateBatchCommand } from './crud/operations/commands/crud-create-batch.command';
export { CrudUpdateCommand } from './crud/operations/commands/crud-update.command';
export { CrudReplaceCommand } from './crud/operations/commands/crud-replace.command';
export { CrudDeleteCommand } from './crud/operations/commands/crud-delete.command';
export { CrudSoftDeleteCommand } from './crud/operations/commands/crud-soft-delete.command';
export { CrudRestoreCommand } from './crud/operations/commands/crud-restore.command';
export { CrudWithBodyCommand } from './crud/operations/commands/crud-with-body.command';

// operations (handlers)
export { CrudListHandler } from './crud/operations/handlers/crud-list.handler';
export { CrudReadHandler } from './crud/operations/handlers/crud-read.handler';
export { CrudCreateHandler } from './crud/operations/handlers/crud-create.handler';
export { CrudCreateBatchHandler } from './crud/operations/handlers/crud-create-batch.handler';
export { CrudUpdateHandler } from './crud/operations/handlers/crud-update.handler';
export { CrudReplaceHandler } from './crud/operations/handlers/crud-replace.handler';
export { CrudDeleteHandler } from './crud/operations/handlers/crud-delete.handler';
export { CrudSoftDeleteHandler } from './crud/operations/handlers/crud-soft-delete.handler';
export { CrudRestoreHandler } from './crud/operations/handlers/crud-restore.handler';
