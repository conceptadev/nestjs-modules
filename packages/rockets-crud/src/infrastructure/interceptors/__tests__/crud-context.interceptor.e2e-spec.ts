import supertest from 'supertest';

import { Param, ParseIntPipe, Query } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { Ctx } from '@concepta/rockets-app';
import {
  OrderSortKeyArr,
  RepositoryInterface,
  WhereConditionArr,
} from '@concepta/rockets-repository';

import { TestCrudAdapter } from '../../../__fixtures__/crud/adapters/test-crud.adapter';
import { TestModelDto } from '../../../__fixtures__/crud/models/test.model';
import { CrudModule } from '../../../crud.module';
import { CrudController } from '../../decorators/controller/crud-controller.decorator';
import { CrudList } from '../../decorators/operations/crud-list.decorator';
import { CrudRead } from '../../decorators/operations/crud-read.decorator';
import { CrudQueryBuilder } from '../../request/crud-query.builder';
import { CrudCtx } from '../crud-context.overlay';
import { CrudContextInterface } from '../interfaces/crud-context.interface';

// tslint:disable:max-classes-per-file
describe('#crud', () => {
  @CrudController({
    path: 'test',
    entity: 'Test',
    adapter: TestCrudAdapter,
    request: {
      params: {
        someParam: { field: 'age', type: 'number' },
      },
    },
    response: {
      resource: TestModelDto,
      serialization: {
        toInstanceOptions: {
          excludeExtraneousValues: false,
          strategy: 'exposeAll',
        },
        toPlainOptions: {
          excludeExtraneousValues: false,
          strategy: 'exposeAll',
        },
      },
    },
  })
  class TestController {
    @CrudList({ path: '/query' })
    async query(@Ctx(CrudCtx) ctx: CrudContextInterface<TestModelDto>) {
      return { query: ctx.withCrud().query };
    }

    @CrudList({ path: '/other' })
    async other(@Query('page', ParseIntPipe) page: number) {
      return { page };
    }

    @CrudRead({ path: '/other2/:someParam' })
    async routeWithParam(@Param('someParam', ParseIntPipe) p: number) {
      return { p };
    }
  }

  @CrudController({
    path: 'test2',
    entity: 'Test2',
    adapter: TestCrudAdapter,
    request: {
      params: {
        id: { field: 'id', type: 'number' },
        someParam: { field: 'age', type: 'number' },
      },
    },
    response: {
      resource: TestModelDto,
      serialization: {
        toInstanceOptions: {
          excludeExtraneousValues: false,
          strategy: 'exposeAll',
        },
        toPlainOptions: {
          excludeExtraneousValues: false,
          strategy: 'exposeAll',
        },
      },
    },
  })
  class Test2Controller {
    @CrudRead({ path: 'normal/:id' })
    async normal(@Ctx(CrudCtx) ctx: CrudContextInterface<TestModelDto>) {
      return { params: ctx.withCrud().params };
    }

    @CrudRead({ path: 'other2/:someParam' })
    async routeWithParam(@Param('someParam', ParseIntPipe) p: number) {
      return { p };
    }

    @CrudRead({
      path: 'other2/:id/twoParams/:someParam',
    })
    async twoParams(
      @Ctx(CrudCtx) ctx: CrudContextInterface<TestModelDto>,
      @Param('someParam', ParseIntPipe) _p: number,
    ) {
      return { params: ctx.withCrud().params };
    }
  }

  let $: ReturnType<typeof supertest>;
  let app: NestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CrudModule.forRoot({})],
      providers: [
        {
          provide: TestCrudAdapter,
          useFactory: () => {
            const mockRepo: RepositoryInterface<TestModelDto> = {
              metadata: {
                name: 'TestModel',
                type: TestModelDto,
                columns: [
                  { name: 'id', isPrimary: true, isRemoveDate: false },
                  { name: 'firstName', isPrimary: false, isRemoveDate: false },
                  { name: 'lastName', isPrimary: false, isRemoveDate: false },
                ],
              },
              find: jest.fn(),
              findOne: jest.fn(),
              count: jest.fn(),
              findAndCount: jest.fn(),
              create: jest.fn(),
              createMany: jest.fn(),
              update: jest.fn(),
              upsert: jest.fn(),
              replace: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
              softDelete: jest.fn(),
              restore: jest.fn(),
              transform: jest.fn(),
              merge: jest.fn(),
              prepare: jest.fn(),
            };
            return new TestCrudAdapter(mockRepo);
          },
        },
      ],
      controllers: [TestController, Test2Controller],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    $ = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('#interceptor', () => {
    let qb: CrudQueryBuilder;

    beforeEach(() => {
      qb = CrudQueryBuilder.create();
    });

    it('should working on non-crud controller', async () => {
      const page = 2;
      const limit = 10;
      const fields = ['a', 'b', 'c'];
      const sorts: OrderSortKeyArr<TestModelDto>[] = [
        ['firstName', 'ASC'],
        ['lastName', 'DESC'],
      ];
      const filters: WhereConditionArr<TestModelDto>[] = [
        ['id', 'in', [1, 2, 3]],
        ['firstName', 'eq', 'John'],
        ['lastName', 'nnull'],
      ];

      qb.setPage(page).setLimit(limit);
      qb.select(fields);
      for (const s of sorts) {
        qb.sortBy({ field: s[0], order: s[1] });
      }
      for (const f of filters) {
        qb.setFilter(f);
      }

      const res = await $.get('/test/query').query(qb.query()).expect(200);
      expect(res.body.query).toHaveProperty('page', page);
      expect(res.body.query).toHaveProperty('limit', limit);
      expect(res.body.query).toHaveProperty('fields', fields);
      expect(res.body.query).toHaveProperty('sort');
      for (let i = 0; i < sorts.length; i++) {
        expect(res.body.query.sort[i]).toHaveProperty('field', sorts[i][0]);
        expect(res.body.query.sort[i]).toHaveProperty('order', sorts[i][1]);
      }
      expect(res.body.query).toHaveProperty('filter');
      for (let i = 0; i < filters.length; i++) {
        expect(res.body.query.filter[i]).toHaveProperty('field', filters[i][0]);
        expect(res.body.query.filter[i]).toHaveProperty(
          'operator',
          filters[i][1],
        );
        if (filters[i][2] !== undefined) {
          expect(res.body.query.filter[i]).toHaveProperty(
            'value',
            filters[i][2],
          );
        }
      }
    });

    it('should others working', async () => {
      const res = await $.get('/test/other')
        .query({ page: 2, limit: 11 })
        .expect(200);
      expect(res.body.page).toBe(2);
    });

    it('should parse param', async () => {
      const res = await $.get('/test/other2/123').expect(200);
      expect(res.body.p).toBe(123);
    });

    it('should parse custom param in crud', async () => {
      const res = await $.get('/test2/other2/123').expect(200);
      expect(res.body.p).toBe(123);
    });

    it('should parse crud param and custom param', async () => {
      const res = await $.get('/test2/other2/1/twoParams/123').expect(200);
      expect(res.body.params).toHaveProperty('id', 1);
      expect(res.body.params).toHaveProperty('age', 123);
    });

    it('should work like before', async () => {
      const res = await $.get('/test2/normal/0').expect(200);
      expect(res.body.params).toHaveProperty('id', 0);
    });
  });
});
