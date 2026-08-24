import { Body, StandardSchemaValidationPipe } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

import { Operation } from '@concepta/nestjs-core';

import { CrudMetaview } from '../../services/crud-metaview.service.js';
import { crudStandardSchemaExceptionFactory } from '../../utils/crud-standard-schema-exception.util.js';

/**
 * Crud initialize validation decorator.
 *
 * Adds a `StandardSchemaValidationPipe` to every parameter called with the
 * `CrudBody` decorator. The schema resolves from `@CrudBody({ schema })`
 * first, falling back to the operation's own `request.body`/`bodyBatch`
 * (method-level only — the controller-level default is typically the full
 * entity schema and is never used for validation). Pipe options come from
 * `metadata.validation`, falling back to the operation-then-controller
 * `@CrudValidate()` hierarchy, merged over the crud-wide default
 * `exceptionFactory` — so callers can tune pipe behavior via plain options
 * instead of subclassing. `validation: false` disables validation for that
 * body (it is still bound, just unvalidated); a body with no resolvable
 * schema is always bound unvalidated.
 */
export const CrudInitValidation = (): ClassDecorator => (classTarget) => {
  const reflectionService = new CrudMetaview();
  const scanner = new MetadataScanner();
  const prototype = classTarget.prototype;

  for (const methodName of scanner.getAllMethodNames(prototype)) {
    const handler = Reflect.get(prototype, methodName);

    // get the body param options for this method
    const bodyParamOptions = reflectionService.getBodyParamOptions(handler);
    if (!bodyParamOptions?.length) continue;

    // validation options resolve method-first, then class (per the
    // @CrudValidate contract)
    const fallbackOptions = reflectionService.getValidationOptions(
      classTarget,
      handler,
    );

    // without an explicit @CrudBody({ schema }), fall back to the schema the
    // operation decorator stored from its own request.body/bodyBatch
    const operation = reflectionService.getOperation(handler);
    const fallbackSchema =
      operation === Operation.CreateBatch
        ? reflectionService.getMethodRequestBodyBatch(handler)
        : reflectionService.getMethodRequestBody(handler);

    // loop all metadatas and set up the pipe
    for (const metadata of bodyParamOptions) {
      const { pipes = [], validation = fallbackOptions } = metadata;
      const schema = metadata.schema ?? fallbackSchema;

      if (schema && validation !== false) {
        Body({
          schema,
          pipes: [
            new StandardSchemaValidationPipe({
              exceptionFactory: crudStandardSchemaExceptionFactory,
              ...validation,
            }),
            ...pipes,
          ],
        })(prototype, methodName, metadata.parameterIndex);
        continue;
      }

      // no schema configured, or validation explicitly disabled — still
      // bind the body, just unvalidated.
      Body(...pipes)(prototype, methodName, metadata.parameterIndex);
    }
  }
};
