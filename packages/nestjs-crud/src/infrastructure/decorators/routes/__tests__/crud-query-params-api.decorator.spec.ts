import { Controller, Get, type INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { Test } from '@nestjs/testing';

import { Operation } from '@concepta/nestjs-core';

import { Swagger } from '../../../utils/swagger.helper.js';
import { CrudQueryParamsApi } from '../crud-query-params-api.decorator.js';

describe('CrudQueryParamsApi', () => {
  let app: INestApplication;
  let doc: OpenAPIObject;

  beforeAll(async () => {
    @Controller('search')
    class SearchController {
      @Get()
      @CrudQueryParamsApi()
      search() {
        return {};
      }
    }

    const module = await Test.createTestingModule({
      controllers: [SearchController],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    doc = SwaggerModule.createDocument(app, new DocumentBuilder().build());
  });

  afterAll(async () => {
    await app.close();
  });

  it('should apply the same @ApiQuery set generated List routes get', () => {
    const parameters: unknown[] = doc.paths['/search']?.get?.parameters ?? [];
    const names = parameters
      .map((p) =>
        typeof p === 'object' && p !== null && 'name' in p ? p.name : undefined,
      )
      .filter((name): name is string => typeof name === 'string');

    // `CrudQueryBuilder`'s paramNamesMap has no `join` entry, so that one
    // meta object's `name` is `undefined` even for real generated CRUD List
    // routes going through the same `Swagger.createQueryParamsMeta` — a
    // pre-existing gap, not something this decorator introduces. Compare
    // only the names both sides can actually produce.
    const expectedNames = Swagger.createQueryParamsMeta(Operation.List)
      .map((meta) => meta.name)
      .filter((name): name is string => typeof name === 'string');

    expect(expectedNames.length).toBeGreaterThan(0);
    expect(names.filter(Boolean)).toEqual(
      expect.arrayContaining(expectedNames),
    );
  });
});
