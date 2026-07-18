import request from 'supertest';

import { Inject, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { Ctx, ExceptionsFilter } from '@concepta/nestjs-core';
import { WhereOperator } from '@concepta/nestjs-repository';

import { TestModelCreateBatchDto } from '../../../../__fixtures__/crud/dto/test-model-create-batch.dto.js';
import { TestModelCreateDto } from '../../../../__fixtures__/crud/dto/test-model-create.dto.js';
import { TestModelUpdateDto } from '../../../../__fixtures__/crud/dto/test-model-update.dto.js';
import { TestModelDto } from '../../../../__fixtures__/crud/models/test.model.js';
import { CrudCreateBatchHandler } from '../../../../application/commands/handlers/crud-create-batch.handler.js';
import { CrudCreateHandler } from '../../../../application/commands/handlers/crud-create.handler.js';
import { CrudDeleteHandler } from '../../../../application/commands/handlers/crud-delete.handler.js';
import { CrudReplaceHandler } from '../../../../application/commands/handlers/crud-replace.handler.js';
import { CrudUpdateHandler } from '../../../../application/commands/handlers/crud-update.handler.js';
import { CrudListHandler } from '../../../../application/queries/handlers/crud-list.handler.js';
import { CrudReadHandler } from '../../../../application/queries/handlers/crud-read.handler.js';
import { CrudModule } from '../../../../crud.module.js';
import { CrudCreateBatchInterface } from '../../../dtos/interfaces/crud-create-batch.interface.js';
import { CrudCtx } from '../../../interceptors/crud-context.overlay.js';
import { CrudContextInterface } from '../../../interceptors/interfaces/crud-context.interface.js';
import { CrudQueryBuilder } from '../../../request/crud-query.builder.js';
import { CrudAdapterResolver } from '../../../resolvers/crud-adapter.resolver.js';
import { CrudResolverInterface } from '../../../resolvers/interfaces/crud-resolver.interface.js';
import { CrudCreateBatch } from '../../operations/crud-create-batch.decorator.js';
import { CrudCreate } from '../../operations/crud-create.decorator.js';
import { CrudDelete } from '../../operations/crud-delete.decorator.js';
import { CrudList } from '../../operations/crud-list.decorator.js';
import { CrudRead } from '../../operations/crud-read.decorator.js';
import { CrudReplace } from '../../operations/crud-replace.decorator.js';
import { CrudUpdate } from '../../operations/crud-update.decorator.js';
import { CrudBody } from '../../params/crud-body.decorator.js';
import { CrudController } from '../crud-controller.decorator.js';

describe('#crud', () => {
  describe('#base methods', () => {
    let app: INestApplication;
    let server: ReturnType<INestApplication['getHttpServer']>;
    let qb: CrudQueryBuilder;

    // Mock CrudResolver for testing decorator behavior
    const mockCrudResolver = {
      list: vi.fn().mockResolvedValue({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 0,
      }),
      read: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createBatch: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      replace: vi.fn().mockResolvedValue({ id: 1 }),
      delete: vi.fn().mockResolvedValue({ id: 1 }),
      restore: vi.fn().mockResolvedValue({ id: 1 }),
    };

    @CrudController({
      path: 'test',
      entity: 'Test',
      request: {
        params: {
          id: { field: 'id', type: 'number' },
        },
        validation: {
          transformOptions: {
            strategy: 'exposeAll',
          },
        },
      },
      response: { resource: TestModelDto },
    })
    class TestController {
      constructor(
        @Inject(CrudAdapterResolver)
        private readonly crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ queryHandler: CrudListHandler })
      async list(@Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>) {
        return this.crudResolver.list(context);
      }

      @CrudRead({ queryHandler: CrudReadHandler })
      async read(@Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>) {
        return this.crudResolver.read(context);
      }

      @CrudCreate({ commandHandler: CrudCreateHandler })
      async create(
        @Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>,
        @CrudBody() dto: TestModelCreateDto,
      ) {
        return this.crudResolver.create(context, dto);
      }

      @CrudReplace({ commandHandler: CrudReplaceHandler })
      async replace(
        @Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>,
        @CrudBody() dto: TestModelCreateDto,
      ) {
        return this.crudResolver.replace(context, dto);
      }

      @CrudUpdate({ commandHandler: CrudUpdateHandler })
      async update(
        @Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>,
        @CrudBody() dto: TestModelUpdateDto,
      ) {
        return this.crudResolver.update(context, dto);
      }

      @CrudCreateBatch({ commandHandler: CrudCreateBatchHandler })
      async createBatch(
        @Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>,
        @CrudBody() dto: TestModelCreateBatchDto,
      ) {
        return this.crudResolver.createBatch(context, dto);
      }

      @CrudDelete({ commandHandler: CrudDeleteHandler })
      async delete(@Ctx(CrudCtx) context: CrudContextInterface<TestModelDto>) {
        return this.crudResolver.delete(context);
      }
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [CrudModule.forRoot({})],
        controllers: [TestController],
        providers: [
          { provide: APP_FILTER, useClass: ExceptionsFilter },
          { provide: CrudAdapterResolver, useValue: mockCrudResolver },
        ],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();
    });

    beforeEach(() => {
      qb = CrudQueryBuilder.create();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#list', () => {
      it('should return status 200', async () => {
        await request(server).get('/test').expect(200);
      });
      it('should return status 400', async () => {
        const query = qb.setFilter(['foo', WhereOperator.GT]).query();
        const expected = {
          statusCode: 400,
          errorCode: 'CRUD_CONTEXT_ERROR',
        };
        const res = await request(server).get('/test').query(query).expect(400);
        expect(res.body).toMatchObject(expected);
      });
    });

    describe('#read', () => {
      it('should return status 200', async () => {
        await request(server).get('/test/1').expect(200);
      });
      it('should return status 400', async () => {
        const expected = {
          statusCode: 400,
          errorCode: 'CRUD_CONTEXT_ERROR',
        };
        const res = await request(server).get('/test/invalid').expect(400);
        expect(res.body).toMatchObject(expected);
      });
    });

    describe('#createBase', () => {
      it('should return status 201', async () => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).post('/test').send(send).expect(201);
      });
      it('should return status 400', async () => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        await request(server).post('/test').send(send).expect(400);
      });
    });

    describe('#createBatch', () => {
      it('should return status 201', async () => {
        const send: CrudCreateBatchInterface<TestModelDto> = {
          bulk: [
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'test@test.com',
              age: 15,
            },
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'test@test.com',
              age: 15,
            },
          ],
        };
        await request(server).post('/test/bulk').send(send).expect(201);
      });
      it('should return status 400', async () => {
        const send: CrudCreateBatchInterface<TestModelDto> = {
          bulk: [],
        };
        await request(server).post('/test/bulk').send(send).expect(400);
      });
    });

    describe('#replace', () => {
      it('should return status 200', async () => {
        const send: TestModelDto = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).put('/test/1').send(send).expect(200);
      });
      it('should return status 400', async () => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        await request(server).put('/test/1').send(send).expect(400);
      });
    });

    describe('#update', () => {
      it('should return status 200', async () => {
        const send: TestModelDto = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).patch('/test/1').send(send).expect(200);
      });
      it('should return status 400', async () => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        await request(server).patch('/test/1').send(send).expect(400);
      });
    });

    describe('#delete', () => {
      it('should return status 204', async () => {
        await request(server).delete('/test/1').expect(204);
      });
    });
  });
});
