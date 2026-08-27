import { z } from 'zod';

import { type INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { Test } from '@nestjs/testing';

import {
  standardSchemaConverter,
  withNamedComponent,
} from '@concepta/nestjs-core';

import { CrudModule } from '../crud.module.js';
import { CrudController } from '../infrastructure/decorators/controller/crud-controller.decorator.js';
import { CrudCreate } from '../infrastructure/decorators/operations/crud-create.decorator.js';
import { CrudBody } from '../infrastructure/decorators/params/crud-body.decorator.js';

import { type OperationObject } from './openapi-types.js';

/**
 * Docs-only regression coverage for #467's mechanism — these all exercise
 * handwritten controllers (no TypeORM needed; `SwaggerModule.createDocument`
 * never invokes a route handler) via `crud-init-api-body.decorator.ts`'s
 * `ApiBody({ standardSchema })`. `request-body-hierarchy.e2e-spec.ts`
 * covers the fully-generated `ConfigurableCrudBuilder` + docs/validation
 * hierarchy convergence case (the reporter's actual config) separately.
 */

function requestBodySchema(doc: OpenAPIObject, path: string): unknown {
  const op = doc.paths[path]?.post as OperationObject | undefined;
  return (
    op?.requestBody as
      | { content?: { 'application/json'?: { schema?: unknown } } }
      | undefined
  )?.content?.['application/json']?.schema;
}

describe('CrudBody({ schema }) beats a differing controller-level default (#467)', () => {
  const controllerLevelSchema = withNamedComponent(
    z.object({ fromController: z.string() }),
    'PrecedenceControllerSchema',
  );
  const paramLevelSchema = withNamedComponent(
    z.object({ fromParam: z.string() }),
    'PrecedenceParamSchema',
  );

  @CrudController({
    path: 'precedence-probe',
    entity: 'PrecedenceProbe',
    request: { body: controllerLevelSchema },
  })
  class PrecedenceProbeControllerFixture {
    @CrudCreate()
    async create(@CrudBody({ schema: paramLevelSchema }) dto: unknown) {
      return dto;
    }
  }

  let doc: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CrudModule.forRoot({})],
      controllers: [PrecedenceProbeControllerFixture],
    }).compile();

    const app: INestApplication = moduleRef.createNestApplication();
    await app.init();

    doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('precedence-probe')
        .setVersion('1.0')
        .build(),
      { standardSchemaConverter },
    );

    await app.close();
  });

  it("documents the parameter's own schema, not the controller-level default", () => {
    expect(requestBodySchema(doc, '/precedence-probe')).toEqual({
      $ref: '#/components/schemas/PrecedenceParamSchema',
    });
    expect(doc.components?.schemas?.PrecedenceControllerSchema).toBeUndefined();
  });
});

describe('nested named components in a request body (#467)', () => {
  const nestedNoteSchema = withNamedComponent(
    z.object({ note: z.string() }),
    'NestedNoteComponent',
  );
  const nestedBodySchema = withNamedComponent(
    z.object({ title: z.string(), note: nestedNoteSchema }),
    'NestedBodyComponent',
  );

  @CrudController({ path: 'nested-body-probe', entity: 'NestedBodyProbe' })
  class NestedBodyProbeControllerFixture {
    @CrudCreate()
    async create(@CrudBody({ schema: nestedBodySchema }) dto: unknown) {
      return dto;
    }
  }

  let doc: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CrudModule.forRoot({})],
      controllers: [NestedBodyProbeControllerFixture],
    }).compile();

    const app: INestApplication = moduleRef.createNestApplication();
    await app.init();

    doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('nested-body-probe')
        .setVersion('1.0')
        .build(),
      { standardSchemaConverter },
    );

    await app.close();
  });

  it('hoists the nested component and rewrites its $ref, with no dangling pointer', () => {
    expect(requestBodySchema(doc, '/nested-body-probe')).toEqual({
      $ref: '#/components/schemas/NestedBodyComponent',
    });
    expect(doc.components?.schemas?.NestedBodyComponent).toBeDefined();
    expect(doc.components?.schemas?.NestedNoteComponent).toBeDefined();

    const docJson = JSON.stringify(doc);
    expect(docJson).not.toContain('#/definitions/');
    expect(docJson).not.toContain('#/$defs/');
  });
});

describe('allowEmpty: false still documents a named body as a $ref (#467)', () => {
  const strictSchema = withNamedComponent(
    z.object({ name: z.string() }),
    'StrictBodyComponent',
  );

  @CrudController({ path: 'strict-body-probe', entity: 'StrictBodyProbe' })
  class StrictBodyProbeControllerFixture {
    @CrudCreate()
    async create(
      @CrudBody({ schema: strictSchema, validation: { allowEmpty: false } })
      dto: unknown,
    ) {
      return dto;
    }
  }

  let doc: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CrudModule.forRoot({})],
      controllers: [StrictBodyProbeControllerFixture],
    }).compile();

    const app: INestApplication = moduleRef.createNestApplication();
    await app.init();

    doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('strict-body-probe')
        .setVersion('1.0')
        .build(),
      { standardSchemaConverter },
    );

    await app.close();
  });

  it("does not degrade to inline (guards withEmptyBodyGuard's .refine() from reaching the docs schema)", () => {
    expect(requestBodySchema(doc, '/strict-body-probe')).toEqual({
      $ref: '#/components/schemas/StrictBodyComponent',
    });
  });
});
