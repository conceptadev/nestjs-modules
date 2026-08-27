import { MetadataScanner } from '@nestjs/core';
import { ApiBody, type ApiBodyOptions } from '@nestjs/swagger';

import { Operation } from '@concepta/nestjs-core';

import { type CrudSchema } from '../../../crud.types.js';
import { CrudException } from '../../exceptions/crud.exception.js';
import { CrudMetaview } from '../../services/crud-metaview.service.js';
import { swagger } from '../../utils/swagger.helper.js';

/**
 * `standardSchema` isn't declared on `@nestjs/swagger`'s `ApiBodyOptions`
 * (12.0.0-alpha.2) the way it already is on `ApiResponseMetadata`, but
 * `SchemaObjectFactory.getSchemaOverride` reads `param.standardSchema` at
 * document-build time regardless — the same mechanism `apply-api-response.decorator.ts`
 * already relies on for responses. This local intersection keeps the call
 * cast-free; a `swagger.spec.ts`/`petstore.spec.ts` assertion guards against a
 * future alpha silently dropping the key.
 */
type ApiBodyOptionsWithStandardSchema = ApiBodyOptions & {
  standardSchema: CrudSchema;
};

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
 * Resolves the request body schema — preferring a parameter-level
 * `@CrudBody({ schema })` (so a caller pinning the schema on the parameter
 * itself isn't silently overridden by a differing class/method default),
 * then falling back to the metadata hierarchy (method → class) — and
 * applies `@ApiBody({ standardSchema })` for each write operation. Passing
 * the schema itself (rather than a pre-converted JSON Schema blob) routes
 * it through the SAME document-level `standardSchemaConverter` responses
 * already use (see `apply-api-response.decorator.ts`), so a schema
 * registered via `withNamedComponent` documents as a `$ref` instead of
 * inlining — dynamically-generated crud controller methods have no
 * `design:paramtypes` reflection metadata for swagger's OWN parameter
 * explorer to pick this up automatically (see parameter-metadata-accessor.js),
 * so it's applied manually here instead.
 *
 * Also removes any placeholder body entry left by the method-level
 * `@CrudApiBody` decorator (added by the operation decorators whenever
 * their own local `request.body` is undefined) so only one body entry
 * exists per operation.
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

    let hierarchySchema: CrudSchema | undefined;

    switch (operation) {
      case Operation.CreateBatch:
        hierarchySchema = reflectionService.getRequestBodyBatch(
          classTarget,
          handler,
        );
        break;
      case Operation.Create:
      case Operation.Update:
      case Operation.Replace:
        hierarchySchema = reflectionService.getRequestBody(
          classTarget,
          handler,
        );
        break;
      default:
        continue;
    }

    const crudBodySchema = reflectionService
      .getBodyParamOptions(handler)
      ?.find((metadata) => metadata.schema)?.schema;

    const bodySchema = crudBodySchema ?? hierarchySchema;
    if (!bodySchema) continue;

    if (!bodySchema['~standard'].jsonSchema?.input) {
      // A schema missing its ~standard.jsonSchema bridge (i.e. never
      // passed through withOpenApi) would otherwise silently produce an
      // undocumented request body — fail loudly instead.
      throw new CrudException({
        message: `Request body schema for "${methodName}" is missing its OpenAPI bridge — wrap it with withOpenApi() before using it as a CRUD request body.`,
      });
    }

    // Remove any existing body entry added by the method-level CrudApiBody
    // placeholder (which renders as `{ type: 'string' }` when left in place).
    // ApiBody() appends to API_PARAMETERS on descriptor.value, so clearing
    // first ensures only one body entry exists after we append the resolved
    // one below.
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

    const options: ApiBodyOptionsWithStandardSchema = {
      standardSchema: bodySchema,
      required: true,
    };

    ApiBody(options)(prototype, methodName, descriptor);
  }
};
