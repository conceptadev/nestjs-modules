import {
  applyDecorators,
  Controller,
  PlainLiteralObject,
} from '@nestjs/common';

import { CRUD_MODULE_DEFAULT_PARAMS_OPTIONS } from '../../../crud.constants';
import { CrudAdapter as CrudAdapterClass } from '../../adapters/crud.adapter';
import { CrudControllerOptionsInterface } from '../../interfaces/crud-controller-options.interface';
import { CrudAdapter } from '../routes/crud-adapter.decorator';
import { CrudEntity } from '../routes/crud-entity.decorator';
import { CrudName } from '../routes/crud-name.decorator';
import { CrudParams } from '../routes/crud-params.decorator';
import { CrudRequestBodyBatch } from '../routes/crud-request-body-batch.decorator';
import { CrudRequestBody } from '../routes/crud-request-body.decorator';
import { CrudResolver } from '../routes/crud-resolver.decorator';
import { CrudResponsePaginated } from '../routes/crud-response-paginated.decorator';
import { CrudResponseResource } from '../routes/crud-response-resource.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

import { CrudInit } from './crud-init.decorator';

/**
 * CRUD controller decorator
 *
 * This decorator is a helper for calling the most common controller level decorators.
 */
export function CrudController<
  T extends PlainLiteralObject = PlainLiteralObject,
>(options: CrudControllerOptionsInterface<T>) {
  // break out options
  const {
    path,
    host,
    entity,
    name,
    adapter = CrudAdapterClass,
    resolver,
    request,
    response,
  } = options;

  // apply all decorators (CrudInit must be last — it resolves query/command metadata)
  return applyDecorators(
    Controller({ path, host }),
    CrudEntity(entity),
    CrudName(name),
    CrudAdapter(adapter),
    CrudResolver(resolver),
    CrudParams<T>(request?.params ?? CRUD_MODULE_DEFAULT_PARAMS_OPTIONS),
    CrudValidate(request?.validation),
    CrudRequestBody(request?.body),
    CrudRequestBodyBatch(request?.bodyBatch),
    CrudResponseResource(response?.resource),
    CrudResponsePaginated(response?.paginated),
    CrudSerialize(response?.serialization),
    CrudInit(),
  );
}
