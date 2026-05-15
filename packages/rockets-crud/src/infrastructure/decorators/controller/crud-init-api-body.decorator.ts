import { Type } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { ApiBody, ApiExtraModels } from '@nestjs/swagger';

import { Operation } from '@concepta/rockets-app';

import { CrudMetaview } from '../../services/crud-metaview.service';
import { swaggerConst } from '../../utils/swagger.helper';

/**
 * \@CrudInit() api body decorator.
 *
 * Resolves the request body type from the metadata hierarchy (method → class)
 * and applies `@ApiBody` with the correct type for each write operation.
 * Removes any placeholder body entry left by the method-level `@CrudApiBody`
 * decorator so only one body entry exists per operation.
 */
export const CrudInitApiBody = (): ClassDecorator => (classTarget) => {
  /* istanbul ignore if */
  if (!swaggerConst) return;

  const API_PARAMETERS = swaggerConst.DECORATORS.API_PARAMETERS;
  const reflectionService = new CrudMetaview();
  const scanner = new MetadataScanner();
  const prototype = classTarget.prototype;

  for (const methodName of scanner.getAllMethodNames(prototype)) {
    const handler = Reflect.get(prototype, methodName);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);

    if (!descriptor) continue;

    const operation = reflectionService.getOperation(handler);
    if (!operation) continue;

    let bodyType: Type | undefined;

    switch (operation) {
      case Operation.CreateBatch:
        bodyType = reflectionService.getRequestBodyBatch(classTarget, handler);
        break;
      case Operation.Create:
      case Operation.Update:
      case Operation.Replace:
        bodyType = reflectionService.getRequestBody(classTarget, handler);
        break;
      default:
        continue;
    }

    if (!bodyType) continue;

    // Remove any existing body entry added by the method-level CrudApiBody call,
    // which may have type: String as a placeholder when bodyType was not yet resolved.
    // ApiBody() appends to API_PARAMETERS on descriptor.value, so clearing first
    // ensures only one body entry exists after we append the resolved one below.
    const existingParams: unknown[] =
      Reflect.getMetadata(API_PARAMETERS, handler) ?? [];
    const withoutBody = existingParams.filter(
      (p) => (p as Record<string, unknown>).in !== 'body',
    );
    Reflect.defineMetadata(API_PARAMETERS, withoutBody, handler);

    // Apply ApiBody with the resolved type — appends to the cleaned array.
    ApiBody({ type: bodyType })(prototype, methodName, descriptor);

    // Register the DTO in components/schemas so $ref resolves correctly.
    ApiExtraModels(bodyType)(classTarget);
  }
};
