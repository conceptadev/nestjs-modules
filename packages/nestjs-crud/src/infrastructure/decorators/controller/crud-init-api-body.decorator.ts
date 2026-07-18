import { type Type } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { ApiBody, ApiExtraModels } from '@nestjs/swagger';

import { Operation } from '@concepta/nestjs-core';

import { CrudMetaview } from '../../services/crud-metaview.service.js';
import { swagger } from '../../utils/swagger.helper.js';

/**
 * Discovers the Reflect metadata key that `@ApiBody()` uses to store
 * parameter descriptors on a route handler. Rather than depending on the
 * private `DECORATORS` constant inside nestjs/swagger (which is a string
 * constant, not a symbol), we apply `@ApiBody` to a probe function and read
 * back which string key it wrote — guaranteeing we use the exact same key
 * that the decorator itself uses, with no dependency on internal APIs.
 *
 * Returns `undefined` when swagger is not installed.
 */
function discoverApiParametersKey(): string | undefined {
  if (!swagger) return undefined;
  // Apply @ApiBody to a probe function and observe which Reflect key it adds.
  const probe = function probe() {};
  const descriptor: PropertyDescriptor = {
    value: probe,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  // Object.create(null) → any, satisfies the MethodDecorator target: Object param
  ApiBody({ type: String })(Object.create(null), 'method', descriptor);
  const keys: unknown[] = Reflect.getMetadataKeys(probe) ?? [];
  // @nestjs/swagger uses a string key (e.g. 'swagger/apiParameters'); find it.
  return keys.find((k): k is string => typeof k === 'string');
}

const API_PARAMETERS_KEY: string | undefined = discoverApiParametersKey();

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
  if (!swagger) return;

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
    if (API_PARAMETERS_KEY) {
      const existingParams: unknown[] =
        Reflect.getMetadata(API_PARAMETERS_KEY, handler) ?? [];
      const withoutBody = existingParams.filter(
        (p) =>
          typeof p !== 'object' ||
          p === null ||
          Reflect.get(p, 'in') !== 'body',
      );
      Reflect.defineMetadata(API_PARAMETERS_KEY, withoutBody, handler);
    }

    // Apply ApiBody with the resolved type — appends to the cleaned array.
    ApiBody({ type: bodyType })(prototype, methodName, descriptor);

    // Register the DTO in components/schemas so $ref resolves correctly.
    ApiExtraModels(bodyType)(classTarget);
  }
};
