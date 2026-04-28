import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import {
  OperationObject,
  ParameterObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Test } from '@nestjs/testing';

import { CrudModule } from '../crud.module';

import { PhotoPaginatedDtoFixture } from '../__fixtures__/photo/dto/photo-paginated.dto.fixture';
import { PhotoDtoFixture } from '../__fixtures__/photo/dto/photo.dto.fixture';
import { PhotoControllerFixture } from '../__fixtures__/photo/photo.controller.fixture';

const ARTIFACT_DIR = join(__dirname, '__artifacts__');

function getOp(
  doc: OpenAPIObject,
  path: string,
  method: string,
): OperationObject | undefined {
  const pathItem = doc.paths[path];
  if (!pathItem) return undefined;
  return (pathItem as Record<string, OperationObject | undefined>)[method];
}

function paramNames(
  doc: OpenAPIObject,
  path: string,
  method: string,
): string[] {
  return (getOp(doc, path, method)?.parameters ?? [])
    .filter((p): p is ParameterObject => !('$ref' in p))
    .map((p) => p.name);
}

describe('CrudModule swagger document', () => {
  let app: INestApplication;
  let doc: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CrudModule.forRoot({})],
      controllers: [PhotoControllerFixture],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Crud Probe').setVersion('1.0').build(),
    );

    mkdirSync(ARTIFACT_DIR, { recursive: true });
    writeFileSync(
      join(ARTIFACT_DIR, 'swagger.json'),
      JSON.stringify(doc, null, 2),
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  // ── Paths ──────────────────────────────────────────────────────────────
  describe('paths', () => {
    it.each<[string, string, string]>([
      ['List', '/photo', 'get'],
      ['Create', '/photo', 'post'],
      ['CreateBatch', '/photo/bulk', 'post'],
      ['Read', '/photo/{id}', 'get'],
      ['Update', '/photo/{id}', 'patch'],
      ['Replace', '/photo/{id}', 'put'],
      ['Delete', '/photo/{id}', 'delete'],
      ['SoftDelete', '/photo/soft/{id}', 'delete'],
      ['Restore', '/photo/restore/{id}', 'patch'],
    ])('%s %s %s', (_op, path, method) => {
      expect(getOp(doc, path, method)).toBeDefined();
    });
  });

  // ── operationIds ───────────────────────────────────────────────────────
  describe('operationIds', () => {
    it.each<[string, string, string, string]>([
      ['list', '/photo', 'get', 'PhotoControllerFixture_list'],
      ['create', '/photo', 'post', 'PhotoControllerFixture_create'],
      [
        'createBatch',
        '/photo/bulk',
        'post',
        'PhotoControllerFixture_createBatch',
      ],
      ['read', '/photo/{id}', 'get', 'PhotoControllerFixture_read'],
      ['update', '/photo/{id}', 'patch', 'PhotoControllerFixture_update'],
      ['replace', '/photo/{id}', 'put', 'PhotoControllerFixture_replace'],
      ['delete', '/photo/{id}', 'delete', 'PhotoControllerFixture_delete'],
      [
        'softDelete',
        '/photo/soft/{id}',
        'delete',
        'PhotoControllerFixture_softDelete',
      ],
      [
        'restore',
        '/photo/restore/{id}',
        'patch',
        'PhotoControllerFixture_restore',
      ],
    ])('%s', (_method, path, httpMethod, expectedId) => {
      expect(getOp(doc, path, httpMethod)?.operationId).toBe(expectedId);
    });
  });

  // ── List query parameters ──────────────────────────────────────────────
  // Actual names come from CrudQueryBuilder.paramNamesMap:
  //   fields → 'select', search → 's', join → not in map (excluded)
  describe('List query parameters', () => {
    it.each([
      'select',
      's',
      'filter',
      'or',
      'sort',
      'limit',
      'offset',
      'page',
      'cache',
      'includeDeleted',
    ])('includes %s', (name) => {
      expect(paramNames(doc, '/photo', 'get')).toContain(name);
    });
  });

  // ── Read query parameters ──────────────────────────────────────────────
  describe('Read query parameters', () => {
    it.each(['select', 'cache', 'includeDeleted'])('includes %s', (name) => {
      expect(paramNames(doc, '/photo/{id}', 'get')).toContain(name);
    });
  });

  // ── Request bodies ─────────────────────────────────────────────────────
  describe('request bodies', () => {
    it.each<[string, string, string]>([
      ['Create', '/photo', 'post'],
      ['Update', '/photo/{id}', 'patch'],
      ['Replace', '/photo/{id}', 'put'],
    ])(
      '%s has requestBody referencing PhotoDtoFixture',
      (_op, path, method) => {
        const rb = getOp(doc, path, method)?.requestBody;
        expect(JSON.stringify(rb)).toContain('PhotoDtoFixture');
      },
    );
  });

  // ── Response schemas ───────────────────────────────────────────────────
  describe('response schemas', () => {
    it('List 200 references PhotoPaginatedDtoFixture', () => {
      const resp = getOp(doc, '/photo', 'get')?.responses?.['200'];
      expect(JSON.stringify(resp)).toContain('PhotoPaginatedDtoFixture');
    });

    it('Read 200 references PhotoDtoFixture', () => {
      const resp = getOp(doc, '/photo/{id}', 'get')?.responses?.['200'];
      expect(JSON.stringify(resp)).toContain('PhotoDtoFixture');
    });
  });

  // ── Component schemas ──────────────────────────────────────────────────
  // The fixture uses PhotoDtoFixture as the controller-level request body,
  // so CrudInitApiBody registers that type in addition to the response types.
  describe('components.schemas', () => {
    it.each([PhotoDtoFixture.name, PhotoPaginatedDtoFixture.name])(
      'registers %s',
      (name) => {
        expect(doc.components?.schemas?.[name]).toBeDefined();
      },
    );
  });
});
