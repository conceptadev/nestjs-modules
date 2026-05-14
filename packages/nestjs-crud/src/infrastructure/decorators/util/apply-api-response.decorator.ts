import { HttpStatus, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseMetadata,
  ApiResponseOptions,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';

import { Operation } from '@concepta/rockets-app';

import { DecoratorTargetObject } from '../../../crud.types';
import { CrudInvalidResponseDto } from '../../dtos/crud-invalid-response.dto';
import { CrudResponsePaginatedDto } from '../../dtos/crud-response-paginated.dto';
import { CrudException } from '../../exceptions/crud.exception';
import { CrudMetaview } from '../../services/crud-metaview.service';

/**
 * Utility decorator used to apply response
 * options *from the controller context*.
 *
 * DO NOT USE THIS DIRECTLY ON METHODS!!!
 */
export function applyApiResponse(
  operation: Operation,
  options: ApiResponseOptions = {},
): MethodDecorator {
  return (target: DecoratorTargetObject, ...rest) => {
    // break out args
    const [propertyKey] = rest;

    // reflection service
    const reflectionService = new CrudMetaview();

    if (!('prototype' in target)) {
      throw new CrudException({
        message:
          'Cannot decorate with apply api response, target must be a class',
      });
    }

    const handler = target.prototype[propertyKey];

    // get the serialize options
    const serializeOptions = reflectionService.getAllSerializationOptions(
      target,
      handler,
    );

    // determine the dto type
    const dto =
      serializeOptions?.type ??
      reflectionService.getResponseResource(target, handler) ??
      CrudInvalidResponseDto;

    // determine pagination dto
    const paginatedDto =
      serializeOptions?.paginatedType ??
      reflectionService.getResponsePaginated(target, handler) ??
      CrudResponsePaginatedDto;

    // dto meta options
    const dtoMetaOptions: ApiResponseMetadata = {};

    // dto schema options — only populated for operations that need a schema object
    let dtoSchemaOptions: Partial<ApiResponseSchemaHost> = {};

    // operation is the discriminator
    switch (operation) {
      // list (paginated)
      case Operation.List:
        dtoSchemaOptions = createListResponse({
          operation: Operation.List,
          modelName: dto.name,
          dto,
          paginatedDto,
        });
        break;

      // create batch (array response)
      case Operation.CreateBatch:
        dtoSchemaOptions = { schema: createArraySchema(dto) };
        break;

      // returns deleted item or empty
      case Operation.Delete:
      case Operation.SoftDelete:
        dtoMetaOptions.type = reflectionService.getReturnDeleted(
          target,
          target.prototype[propertyKey],
        )
          ? dto
          : undefined;
        break;

      // returns restored item or empty
      case Operation.Restore:
        dtoMetaOptions.type = reflectionService.getReturnRestored(
          target,
          target.prototype[propertyKey],
        )
          ? dto
          : undefined;
        break;

      // returns one item
      case Operation.Read:
      case Operation.Create:
      case Operation.Update:
      case Operation.Replace:
      default:
        dtoMetaOptions.type = dto;
        break;
    }

    // merge the options
    const mergedOptions: ApiResponseOptions = {
      status: HttpStatus.OK,
      description: `${operation} ${dto.name}`,
      ...dtoMetaOptions,
      ...dtoSchemaOptions,
      ...options,
    };

    ApiExtraModels(paginatedDto)(target, ...rest);
    ApiResponse(mergedOptions)(target, ...rest);
  };
}

//
// private routines
//

function createArraySchema(dto: Type): ApiResponseSchemaHost['schema'] {
  return {
    type: 'array',
    items: {
      $ref: getSchemaPath(dto),
    },
  };
}

function createPaginatedSchema(
  paginatedDto: Type,
): ApiResponseSchemaHost['schema'] {
  return {
    $ref: getSchemaPath(paginatedDto),
  };
}

function createPaginatedResponse(options: {
  operation: Operation;
  modelName: string;
  paginatedDto: Type;
}): ApiResponseSchemaHost {
  return {
    description: `${options.operation} ${options.modelName} as paginated response.`,
    schema: createPaginatedSchema(options.paginatedDto),
  };
}

function createListResponse(options: {
  operation: Operation;
  modelName: string;
  dto: Type;
  paginatedDto: Type;
}): ApiResponseSchemaHost {
  // always use paginated type
  return createPaginatedResponse(options);
}
