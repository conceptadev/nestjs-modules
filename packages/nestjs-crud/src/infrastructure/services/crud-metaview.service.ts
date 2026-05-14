import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import {
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

import { Operation } from '@concepta/rockets-app';

import {
  ControllerTarget,
  CrudValidationOptions,
  MethodHandler,
} from '../../crud.types';
import { CrudApiParam } from '../decorators/openapi/crud-api-param.decorator';
import { CrudApiQuery } from '../decorators/openapi/crud-api-query.decorator';
import { CrudApiResponse } from '../decorators/openapi/crud-api-response.decorator';
import { CrudBody } from '../decorators/params/crud-body.decorator';
import { CrudBodyMetadataInterface } from '../decorators/params/interfaces/crud-body-metadata.interface';
import { CrudAdapter } from '../decorators/routes/crud-adapter.decorator';
import { CrudAllow } from '../decorators/routes/crud-allow.decorator';
import { CrudCache } from '../decorators/routes/crud-cache.decorator';
import {
  CrudCommandHandler,
  CrudCommandHandlerOptionsInterface,
} from '../decorators/routes/crud-command-handler.decorator';
import {
  CrudCommand,
  CrudCommandOptionsInterface,
} from '../decorators/routes/crud-command.decorator';
import { CrudEntity } from '../decorators/routes/crud-entity.decorator';
import { CrudExclude } from '../decorators/routes/crud-exclude.decorator';
import { CrudFilter } from '../decorators/routes/crud-filter.decorator';
import { CrudJoin } from '../decorators/routes/crud-join.decorator';
import { CrudLimit } from '../decorators/routes/crud-limit.decorator';
import { CrudMaxLimit } from '../decorators/routes/crud-max-limit.decorator';
import { CrudName } from '../decorators/routes/crud-name.decorator';
import { CrudOperation } from '../decorators/routes/crud-operation.decorator';
import { CrudParams } from '../decorators/routes/crud-params.decorator';
import { CrudPersist } from '../decorators/routes/crud-persist.decorator';
import {
  CrudQueryHandler,
  CrudQueryHandlerOptionsInterface,
} from '../decorators/routes/crud-query-handler.decorator';
import {
  CrudQuery,
  CrudQueryDecoratorOptionsInterface,
} from '../decorators/routes/crud-query.decorator';
import { CrudRequestBodyBatch } from '../decorators/routes/crud-request-body-batch.decorator';
import { CrudRequestBody } from '../decorators/routes/crud-request-body.decorator';
import { CrudResolver } from '../decorators/routes/crud-resolver.decorator';
import { CrudResponsePaginated } from '../decorators/routes/crud-response-paginated.decorator';
import { CrudResponseResource } from '../decorators/routes/crud-response-resource.decorator';
import { CrudReturnDeleted } from '../decorators/routes/crud-return-deleted.decorator';
import { CrudReturnRestored } from '../decorators/routes/crud-return-restored.decorator';
import { CrudSerialize } from '../decorators/routes/crud-serialize.decorator';
import { CrudSort } from '../decorators/routes/crud-sort.decorator';
import { CrudValidate } from '../decorators/routes/crud-validate.decorator';
import { CrudParamsOptionsInterface } from '../interfaces/crud-params-options.interface';
import { CrudSerializationOptionsInterface } from '../interfaces/crud-serialization-options.interface';
import { CrudOptionsInterface } from '../request/interfaces/crud-options.interface';
import {
  CrudResolverInterface,
  CrudResolverStatic,
} from '../resolvers/interfaces/crud-resolver.interface';

import { CrudMetadata } from './crud-metadata.service';

@Injectable()
export class CrudMetaview<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  public getContextOptions(
    target: ControllerTarget,
    handler: MethodHandler,
  ): CrudOptionsInterface<Entity> {
    return {
      params: this.getAllParamOptions(target, handler) ?? {
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },

      query: {
        allow: CrudMetadata.getHierarchyArray(CrudAllow, handler, target),
        exclude: CrudMetadata.getHierarchyArray(CrudExclude, handler, target),
        persist: CrudMetadata.getHierarchyArray(CrudPersist, handler, target),
        filter: CrudMetadata.getHierarchy(CrudFilter, handler, target) ?? {},
        sort: CrudMetadata.getHierarchyArray(CrudSort, handler, target),
        limit: CrudMetadata.getHierarchy(CrudLimit, handler, target),
        maxLimit: CrudMetadata.getHierarchy(CrudMaxLimit, handler, target),
        cache: CrudMetadata.getHierarchy(CrudCache, handler, target),
        join: CrudMetadata.getHierarchyArray(CrudJoin, handler, target),
      },
    };
  }

  public getOperation(handler: MethodHandler): Operation | undefined {
    return CrudMetadata.getHierarchy(CrudOperation, handler);
  }

  public getEntity(target: ControllerTarget): string | undefined {
    return CrudMetadata.getHierarchy(CrudEntity, target);
  }

  public getName(target: ControllerTarget): string | undefined {
    return CrudMetadata.getHierarchy(CrudName, target);
  }

  public getAdapter(target: ControllerTarget): Type | undefined {
    return CrudMetadata.getHierarchy(CrudAdapter, target);
  }

  public getAllParamOptions(
    target: ControllerTarget,
    handler: MethodHandler,
  ): CrudParamsOptionsInterface<Entity> | undefined {
    return CrudMetadata.getHierarchy(CrudParams, handler, target);
  }

  public getValidationOptions(
    target: ControllerTarget,
    handler?: MethodHandler,
  ): CrudValidationOptions<Entity> | undefined {
    if (handler) {
      return CrudMetadata.getHierarchy(CrudValidate, handler, target);
    }
    return CrudMetadata.getHierarchy(CrudValidate, target);
  }

  public getBodyParamOptions(
    handler: MethodHandler,
  ): CrudBodyMetadataInterface[] | undefined {
    return CrudMetadata.getHierarchy(CrudBody, handler);
  }

  public getAllSerializationOptions(
    target: ControllerTarget,
    handler: MethodHandler,
  ): CrudSerializationOptionsInterface | undefined {
    return CrudMetadata.getHierarchy(CrudSerialize, handler, target);
  }

  public getApiQueryOptions(
    handler: MethodHandler,
  ): ApiQueryOptions[][] | undefined {
    return CrudMetadata.getHierarchy(CrudApiQuery, handler);
  }

  public getApiParamsOptions(
    handler: MethodHandler,
  ): ApiParamOptions[] | undefined {
    return CrudMetadata.getHierarchy(CrudApiParam, handler);
  }

  public getApiResponseOptions(
    handler: MethodHandler,
  ): ApiResponseOptions[] | undefined {
    return CrudMetadata.getHierarchy(CrudApiResponse, handler);
  }

  public getQuery(
    handler: MethodHandler,
  ): CrudQueryDecoratorOptionsInterface<Entity> | undefined {
    return CrudMetadata.getHierarchy(CrudQuery, handler);
  }

  public getCommand(
    handler: MethodHandler,
  ): CrudCommandOptionsInterface<Entity> | undefined {
    return CrudMetadata.getHierarchy(CrudCommand, handler);
  }

  public getQueryHandler(
    handler: MethodHandler,
  ): CrudQueryHandlerOptionsInterface<Entity> | undefined {
    return CrudMetadata.getHierarchy(CrudQueryHandler, handler);
  }

  public getCommandHandler(
    handler: MethodHandler,
  ): CrudCommandHandlerOptionsInterface<Entity> | undefined {
    return CrudMetadata.getHierarchy(CrudCommandHandler, handler);
  }

  public getReturnDeleted(
    target: ControllerTarget,
    handler: MethodHandler,
  ): boolean {
    return (
      CrudMetadata.getHierarchy(CrudReturnDeleted, handler, target) ?? false
    );
  }

  public getReturnRestored(
    target: ControllerTarget,
    handler: MethodHandler,
  ): boolean {
    return (
      CrudMetadata.getHierarchy(CrudReturnRestored, handler, target) ?? false
    );
  }

  public getRequestBody(
    target: ControllerTarget,
    handler: MethodHandler,
  ): Type | undefined {
    return CrudMetadata.getHierarchy(CrudRequestBody, handler, target);
  }

  public getRequestBodyBatch(
    target: ControllerTarget,
    handler: MethodHandler,
  ): Type | undefined {
    return CrudMetadata.getHierarchy(CrudRequestBodyBatch, handler, target);
  }

  public getResponseResource(
    target: ControllerTarget,
    handler: MethodHandler,
  ): Type | undefined {
    return CrudMetadata.getHierarchy(CrudResponseResource, handler, target);
  }

  public getResponsePaginated(
    target: ControllerTarget,
    handler: MethodHandler,
  ): Type | undefined {
    return CrudMetadata.getHierarchy(CrudResponsePaginated, handler, target);
  }

  /**
   * Get the resolver class for a route.
   *
   * Resolution order: `method > controller > undefined` (caller uses module default)
   */
  public getResolver(
    target: ControllerTarget,
    handler: MethodHandler,
  ): (Type<CrudResolverInterface> & CrudResolverStatic) | undefined {
    return CrudMetadata.getHierarchy(CrudResolver, handler, target);
  }
}
