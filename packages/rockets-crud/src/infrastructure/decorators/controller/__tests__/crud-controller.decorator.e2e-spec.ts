import request from 'supertest';

import { Inject, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { Ctx, ExceptionsFilter } from '@concepta/rockets-app';
import { WhereOperator } from '@concepta/rockets-repository';

import { TestModelCreateBatchDto } from '../../../../__fixtures__/crud/dto/test-model-create-batch.dto';
import { TestModelCreateDto } from '../../../../__fixtures__/crud/dto/test-model-create.dto';
import { TestModelUpdateDto } from '../../../../__fixtures__/crud/dto/test-model-update.dto';
import { TestModelDto } from '../../../../__fixtures__/crud/models/test.model';
import { CrudCreateBatchHandler } from '../../../../application/commands/handlers/crud-create-batch.handler';
import { CrudCreateHandler } from '../../../../application/commands/handlers/crud-create.handler';
import { CrudDeleteHandler } from '../../../../application/commands/handlers/crud-delete.handler';
import { CrudReplaceHandler } from '../../../../application/commands/handlers/crud-replace.handler';
import { CrudUpdateHandler } from '../../../../application/commands/handlers/crud-update.handler';
import { CrudListHandler } from '../../../../application/queries/handlers/crud-list.handler';
import { CrudReadHandler } from '../../../../application/queries/handlers/crud-read.handler';
import { CrudModule } from '../../../../crud.module';
import { CrudCreateBatchInterface } from '../../../dtos/interfaces/crud-create-batch.interface';
import { CrudCtx } from '../../../interceptors/crud-context.overlay';
import { CrudContextInterface } from '../../../interceptors/interfaces/crud-context.interface';
import { CrudQueryBuilder } from '../../../request/crud-query.builder';
import { CrudAdapterResolver } from '../../../resolvers/crud-adapter.resolver';
import { CrudResolverInterface } from '../../../resolvers/interfaces/crud-resolver.interface';
import { CrudCreateBatch } from '../../operations/crud-create-batch.decorator';
import { CrudCreate } from '../../operations/crud-create.decorator';
import { CrudDelete } from '../../operations/crud-delete.decorator';
import { CrudList } from '../../operations/crud-list.decorator';
import { CrudRead } from '../../operations/crud-read.decorator';
import { CrudReplace } from '../../operations/crud-replace.decorator';
import { CrudUpdate } from '../../operations/crud-update.decorator';
import { CrudBody } from '../../params/crud-body.decorator';
import { CrudController } from '../crud-controller.decorator';

describe('#crud', () => {
  describe('#base methods', () => {
    let app: INestApplication;
    let server: ReturnType<INestApplication['getHttpServer']>;
    let qb: CrudQueryBuilder;

    // Mock CrudResolver for testing decorator behavior
    const mockCrudResolver = {
      list: jest.fn().mockResolvedValue({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 0,
      }),
      read: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      createBatch: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      replace: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockResolvedValue({ id: 1 }),
      restore: jest.fn().mockResolvedValue({ id: 1 }),
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
      app.close();
    });

    describe('#list', () => {
      it('should return status 200', (done) => {
        request(server)
          .get('/test')
          .end((_, res) => {
            expect(res.status).toEqual(200);
            done();
          });
      });
      it('should return status 400', (done) => {
        const query = qb.setFilter(['foo', WhereOperator.GT]).query();
        request(server)
          .get('/test')
          .query(query)
          .end((_, res) => {
            const expected = {
              statusCode: 400,
              errorCode: 'CRUD_CONTEXT_ERROR',
            };
            expect(res.status).toEqual(400);
            expect(res.body).toMatchObject(expected);
            done();
          });
      });
    });

    describe('#read', () => {
      it('should return status 200', (done) => {
        request(server)
          .get('/test/1')
          .end((_, res) => {
            expect(res.status).toEqual(200);
            done();
          });
      });
      it('should return status 400', (done) => {
        request(server)
          .get('/test/invalid')
          .end((_, res) => {
            const expected = {
              statusCode: 400,
              errorCode: 'CRUD_CONTEXT_ERROR',
            };
            expect(res.status).toEqual(400);
            expect(res.body).toMatchObject(expected);
            done();
          });
      });
    });

    describe('#createBase', () => {
      it('should return status 201', (done) => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        request(server)
          .post('/test')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(201);
            done();
          });
      });
      it('should return status 400', (done) => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        request(server)
          .post('/test')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });

    describe('#createBatch', () => {
      it('should return status 201', (done) => {
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
        request(server)
          .post('/test/bulk')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(201);
            done();
          });
      });
      it('should return status 400', (done) => {
        const send: CrudCreateBatchInterface<TestModelDto> = {
          bulk: [],
        };
        request(server)
          .post('/test/bulk')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });

    describe('#replace', () => {
      it('should return status 200', (done) => {
        const send: TestModelDto = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        request(server)
          .put('/test/1')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(200);
            done();
          });
      });
      it('should return status 400', (done) => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        request(server)
          .put('/test/1')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });

    describe('#update', () => {
      it('should return status 200', (done) => {
        const send: TestModelDto = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        request(server)
          .patch('/test/1')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(200);
            done();
          });
      });
      it('should return status 400', (done) => {
        const send: TestModelDto = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        request(server)
          .patch('/test/1')
          .send(send)
          .end((_, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });

    describe('#delete', () => {
      it('should return status 204', (done) => {
        request(server)
          .delete('/test/1')
          .end((_, res) => {
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
  });
});
