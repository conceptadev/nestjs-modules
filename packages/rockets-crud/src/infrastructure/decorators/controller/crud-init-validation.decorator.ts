import { Body, ValidationPipe } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

import { CRUD_MODULE_DEFAULT_VALIDATION_PIPE_OPTIONS } from '../../../crud.constants';
import { CrudMetaview } from '../../services/crud-metaview.service';

/**
 * Crud initialize validation decorator.
 *
 * Add a ValidationPipe to every parameter called with the `CrudBody` decorator.
 */
export const CrudInitValidation = (): ClassDecorator => (classTarget) => {
  const reflectionService = new CrudMetaview();
  const scanner = new MetadataScanner();
  const prototype = classTarget.prototype;

  // get the fallback validation options
  const fallbackOptions = reflectionService.getValidationOptions(classTarget);

  for (const methodName of scanner.getAllMethodNames(prototype)) {
    const handler = Reflect.get(prototype, methodName);

    // get the body param options for this method
    const bodyParamOptions = reflectionService.getBodyParamOptions(handler);
    if (!bodyParamOptions?.length) continue;

    // loop all metadatas and set up the pipe
    for (const metadata of bodyParamOptions) {
      let { pipes = [] } = metadata;
      const { validation = fallbackOptions } = metadata;

      // are we injecting validation?
      if (validation !== false) {
        // yes, merge options
        const finalOptions = {
          ...CRUD_MODULE_DEFAULT_VALIDATION_PIPE_OPTIONS,
          ...validation,
        };

        // create new pipe
        const paramPipe = new ValidationPipe(finalOptions);

        // put our validation pipe first
        pipes = [paramPipe, ...pipes];
      }

      // create the body decorator
      Body(...pipes)(prototype, methodName, metadata.parameterIndex);
    }
  }
};
