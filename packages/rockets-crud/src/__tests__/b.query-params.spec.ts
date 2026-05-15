import 'jest-extended';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { Inject, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionsFilter, Ctx } from '@concepta/rockets-app';
import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

import { CrudUpdateHandler } from '../application/commands/handlers/crud-update.handler';
import { CrudListHandler } from '../application/queries/handlers/crud-list.handler';
import { CrudReadHandler } from '../application/queries/handlers/crud-read.handler';
import {
  createQueryHandler,
  createCommandHandler,
} from '../application/utils/create-operation-handlers';
import { CrudModule } from '../crud.module';
import { CrudAdapter } from '../infrastructure/adapters/crud.adapter';
import { CrudController } from '../infrastructure/decorators/controller/crud-controller.decorator';
import { CrudList } from '../infrastructure/decorators/operations/crud-list.decorator';
import { CrudRead } from '../infrastructure/decorators/operations/crud-read.decorator';
import { CrudUpdate } from '../infrastructure/decorators/operations/crud-update.decorator';
import { CrudBody } from '../infrastructure/decorators/params/crud-body.decorator';
import { CrudAllow } from '../infrastructure/decorators/routes/crud-allow.decorator';
import { CrudExclude } from '../infrastructure/decorators/routes/crud-exclude.decorator';
import { CrudFilter } from '../infrastructure/decorators/routes/crud-filter.decorator';
import { CrudLimit } from '../infrastructure/decorators/routes/crud-limit.decorator';
import { CrudMaxLimit } from '../infrastructure/decorators/routes/crud-max-limit.decorator';
import { CrudSort } from '../infrastructure/decorators/routes/crud-sort.decorator';
import { CrudCtx } from '../infrastructure/interceptors/crud-context.overlay';
import { CrudContextInterface } from '../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudQueryBuilder } from '../infrastructure/request/crud-query.builder';
import { CrudAdapterResolver } from '../infrastructure/resolvers/crud-adapter.resolver';
import { CrudResolverInterface } from '../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { createCrudAdapterProvider } from '../infrastructure/utils/create-crud-adapter-provider';

import { createCrudOperationClasses } from '../__fixtures__/crud/create-crud-operation-classes.fixture';
import {
  CRUD_TEST_COMPANY_ENTITY_NAME,
  CRUD_TEST_NOTE_ENTITY_NAME,
  CRUD_TEST_PROJECT_ENTITY_NAME,
  CRUD_TEST_USER_ENTITY_NAME,
} from '../__fixtures__/crud-test.constants';
import { CompanyEntity } from '../__fixtures__/typeorm/company/company.entity';
import { CompanyPaginatedDto } from '../__fixtures__/typeorm/company/dto/company-paginated.dto';
import { CompanyDto } from '../__fixtures__/typeorm/company/dto/company.dto';
import { NotePaginatedDto } from '../__fixtures__/typeorm/note/dto/note-paginated.dto';
import { NoteDto } from '../__fixtures__/typeorm/note/dto/note.dto';
import { NoteEntity } from '../__fixtures__/typeorm/note/note.entity';
import { ormSqliteConfig } from '../__fixtures__/typeorm/orm.sqlite.config';
import { ProjectCreateDto } from '../__fixtures__/typeorm/project/dto/project-create.dto';
import { ProjectPaginatedDto } from '../__fixtures__/typeorm/project/dto/project-paginated.dto';
import { ProjectDto } from '../__fixtures__/typeorm/project/dto/project.dto';
import { ProjectEntity } from '../__fixtures__/typeorm/project/project.entity';
import { Seeds } from '../__fixtures__/typeorm/seeds';
import { UserPaginatedDto } from '../__fixtures__/typeorm/users/dto/user-paginated.dto';
import { UserDto } from '../__fixtures__/typeorm/users/dto/user.dto';
import { UserEntity } from '../__fixtures__/typeorm/users/user.entity';

// Create entity-specific operation classes
const CompanyOps = createCrudOperationClasses<CompanyEntity>(
  CRUD_TEST_COMPANY_ENTITY_NAME,
);
const ProjectOps = createCrudOperationClasses<ProjectEntity>(
  CRUD_TEST_PROJECT_ENTITY_NAME,
);
const UserOps = createCrudOperationClasses<UserEntity>(
  CRUD_TEST_USER_ENTITY_NAME,
);
const NoteOps = createCrudOperationClasses<NoteEntity>(
  CRUD_TEST_NOTE_ENTITY_NAME,
);

// Create entity-specific handlers
const CompanyListHandler = createQueryHandler({
  entity: CRUD_TEST_COMPANY_ENTITY_NAME,
  baseClass: CrudListHandler,
  queryClass: CompanyOps.CrudListQuery,
});

const ProjectListHandler = createQueryHandler({
  entity: CRUD_TEST_PROJECT_ENTITY_NAME,
  baseClass: CrudListHandler,
  queryClass: ProjectOps.CrudListQuery,
});
const ProjectReadHandler = createQueryHandler({
  entity: CRUD_TEST_PROJECT_ENTITY_NAME,
  baseClass: CrudReadHandler,
  queryClass: ProjectOps.CrudReadQuery,
});
const ProjectUpdateHandler = createCommandHandler({
  entity: CRUD_TEST_PROJECT_ENTITY_NAME,
  baseClass: CrudUpdateHandler,
  commandClass: ProjectOps.CrudUpdateCommand,
});

const UserListHandler = createQueryHandler({
  entity: CRUD_TEST_USER_ENTITY_NAME,
  baseClass: CrudListHandler,
  queryClass: UserOps.CrudListQuery,
});

const NoteListHandler = createQueryHandler({
  entity: CRUD_TEST_NOTE_ENTITY_NAME,
  baseClass: CrudListHandler,
  queryClass: NoteOps.CrudListQuery,
});

// tslint:disable:max-classes-per-file
describe('#crud-typeorm', () => {
  describe('#query params', () => {
    let app: INestApplication;
    let server: ReturnType<INestApplication['getHttpServer']>;
    let qb: CrudQueryBuilder;

    @CrudController({
      path: 'companies',
      entity: CRUD_TEST_COMPANY_ENTITY_NAME,
      request: {
        body: CompanyDto,
      },
      response: {
        resource: CompanyDto,
        paginated: CompanyPaginatedDto,
      },
    })
    @CrudExclude(['updatedAt'])
    @CrudFilter({ id: { $ne: 1 } })
    @CrudAllow(['id', 'name', 'domain', 'description'])
    @CrudMaxLimit(5)
    class CompaniesController {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: CompanyOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<CompanyEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'projects',
      entity: CRUD_TEST_PROJECT_ENTITY_NAME,
      request: {
        params: {
          id: {
            field: 'id',
            type: 'number',
            primary: true,
          },
        },
        body: ProjectCreateDto,
      },
      response: {
        resource: ProjectDto,
        paginated: ProjectPaginatedDto,
      },
    })
    @CrudSort([{ field: 'id', order: 'ASC' }])
    @CrudLimit(100)
    class ProjectsController {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: ProjectOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>) {
        return this.crudResolver.list(context);
      }

      @CrudRead({ query: ProjectOps.CrudReadQuery })
      read(@Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>) {
        return this.crudResolver.read(context);
      }

      @CrudUpdate({ command: ProjectOps.CrudUpdateCommand })
      update(
        @Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>,
        @CrudBody() project: ProjectCreateDto,
      ) {
        return this.crudResolver.update(context, project);
      }
    }

    @CrudController({
      path: 'projects2',
      entity: CRUD_TEST_PROJECT_ENTITY_NAME,
      request: {
        body: ProjectDto,
      },
      response: {
        resource: ProjectDto,
        paginated: ProjectPaginatedDto,
      },
    })
    class ProjectsController2 {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: ProjectOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'projects3',
      entity: CRUD_TEST_PROJECT_ENTITY_NAME,
      request: {
        body: ProjectDto,
      },
      response: {
        resource: ProjectDto,
        paginated: ProjectPaginatedDto,
      },
    })
    @CrudFilter({ isActive: false })
    class ProjectsController3 {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: ProjectOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'projects4',
      entity: CRUD_TEST_PROJECT_ENTITY_NAME,
      request: {
        body: ProjectDto,
      },
      response: {
        resource: ProjectDto,
        paginated: ProjectPaginatedDto,
      },
    })
    @CrudFilter({ isActive: true })
    class ProjectsController4 {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: ProjectOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<ProjectEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'users',
      entity: CRUD_TEST_USER_ENTITY_NAME,
      request: {
        body: UserDto,
      },
      response: {
        resource: UserDto,
        paginated: UserPaginatedDto,
      },
    })
    class UsersController {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: UserOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<UserEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'notes',
      entity: CRUD_TEST_NOTE_ENTITY_NAME,
      request: {
        body: NoteDto,
      },
      response: {
        resource: NoteDto,
        paginated: NotePaginatedDto,
      },
    })
    class NotesController {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: NoteOps.CrudListQuery })
      list(@Ctx(CrudCtx) context: CrudContextInterface<NoteEntity>) {
        return this.crudResolver.list(context);
      }
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({ ...ormSqliteConfig }),
          RepositoryModule.forRoot({}),
          RepositoryModule.forFeature({
            module: TypeOrmRepositoryModule,
            entities: [
              { key: CRUD_TEST_COMPANY_ENTITY_NAME, entity: CompanyEntity },
              { key: CRUD_TEST_PROJECT_ENTITY_NAME, entity: ProjectEntity },
              { key: CRUD_TEST_USER_ENTITY_NAME, entity: UserEntity },
              { key: CRUD_TEST_NOTE_ENTITY_NAME, entity: NoteEntity },
            ],
          }),
          CrudModule.forRoot({}),
        ],
        controllers: [
          CompaniesController,
          ProjectsController,
          ProjectsController2,
          ProjectsController3,
          ProjectsController4,
          UsersController,
          NotesController,
        ],
        providers: [
          { provide: APP_FILTER, useClass: ExceptionsFilter },
          createCrudAdapterProvider({
            entity: CRUD_TEST_COMPANY_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          CompanyListHandler,
          createCrudAdapterProvider({
            entity: CRUD_TEST_USER_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          UserListHandler,
          createCrudAdapterProvider({
            entity: CRUD_TEST_PROJECT_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          ProjectListHandler,
          ProjectReadHandler,
          ProjectUpdateHandler,
          createCrudAdapterProvider({
            entity: CRUD_TEST_NOTE_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          NoteListHandler,
        ],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();

      server = app.getHttpServer();

      const datasource = app.get<DataSource>(getDataSourceToken());
      const seeds = new Seeds();
      await seeds.up(datasource.createQueryRunner());
    });

    beforeEach(() => {
      qb = CrudQueryBuilder.create();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#select', () => {
      it('should throw status 400', async () => {
        qb.setFilter({ field: 'invalid', operator: 'null' });
        await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(400);
      });
    });

    describe('#query filter', () => {
      it('should return data with limit', async () => {
        qb.setLimit(4);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(4);
        res.body.data.forEach((e: CompanyEntity) => {
          expect(e.id).not.toBe(1);
        });
      });
      it('should return with maxLimit', async () => {
        qb.setLimit(7);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(5);
      });
      it('should return with filter and or, 1', async () => {
        qb.setFilter({
          field: 'name',
          operator: 'nin',
          value: ['Name2', 'Name3'],
        }).setOr({ field: 'domain', operator: 'contains', value: 5 });
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(5);
      });
      it('should return with filter and or, 2', async () => {
        qb.setFilter({ field: 'name', operator: 'ends', value: 'foo' })
          .setOr({ field: 'name', operator: 'starts', value: 'P' })
          .setOr({ field: 'isActive', operator: 'eq', value: true });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(10);
      });
      it('should return with filter and or, 3', async () => {
        qb.setOr({ field: 'companyId', operator: 'gt', value: 22 })
          .setFilter({ field: 'companyId', operator: 'gte', value: 6 })
          .setFilter({ field: 'companyId', operator: 'lt', value: 10 });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(8);
      });
      it('should return with filter and or, 4', async () => {
        qb.setOr({ field: 'companyId', operator: 'in', value: [6, 10] })
          .setOr({ field: 'companyId', operator: 'lte', value: 10 })
          .setFilter({ field: 'isActive', operator: 'eq', value: false })
          .setFilter({ field: 'description', operator: 'nnull' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(10);
      });
      it('should return with filter and or, 5', async () => {
        qb.setOr({ field: 'companyId', operator: 'null' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(0);
      });
      it('should return with filter and or, 6', async () => {
        qb.setOr({ field: 'companyId', operator: 'between', value: [1, 5] });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(10);
      });
      it('should return with filter, 1', async () => {
        qb.setOr({ field: 'companyId', operator: 'eq', value: 1 });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(2);
      });
      it('should return with $ncontains filter', async () => {
        qb.setFilter({
          field: 'name',
          operator: 'ncontains',
          value: 'Project1',
        });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        res.body.data.forEach((e: ProjectEntity) => {
          expect(e.name).not.toBe('Project1');
        });
      });
      it('should apply default @CrudFilter and exclude company 1', async () => {
        const res = await request(server).get('/companies').expect(200);
        const ids = res.body.data.map((c: CompanyEntity) => c.id);
        expect(ids).not.toContain(1);
      });
      it('should apply default @CrudLimit when no limit param is set', async () => {
        const res = await request(server).get('/projects').expect(200);
        expect(res.body.data).toHaveLength(20);
      });
    });

    describe('#pagination', () => {
      it('should return page 1 with correct metadata', async () => {
        qb.setLimit(3).setPage(1);
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: expect.any(Array),
          count: 3,
          total: 20,
          page: 1,
          pageCount: 7,
          limit: 3,
        });
        expect(res.body.data).toHaveLength(3);
      });
      it('should return page 2 with correct offset', async () => {
        qb.setLimit(3).setPage(2).sortBy({ field: 'id', order: 'ASC' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: [
            expect.objectContaining({ id: 4 }),
            expect.objectContaining({ id: 5 }),
            expect.objectContaining({ id: 6 }),
          ],
          count: 3,
          total: 20,
          page: 2,
          pageCount: 7,
          limit: 3,
        });
      });
      it('should return last page with fewer items', async () => {
        qb.setLimit(3).setPage(7).sortBy({ field: 'id', order: 'ASC' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: [
            expect.objectContaining({ id: 19 }),
            expect.objectContaining({ id: 20 }),
          ],
          count: 2,
          total: 20,
          page: 7,
          pageCount: 7,
          limit: 3,
        });
      });
      it('should return empty data for page beyond total', async () => {
        qb.setLimit(3).setPage(100);
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: [],
          count: 0,
          total: 20,
          page: 100,
          pageCount: 7,
          limit: 3,
        });
      });
      it('should return data with offset and limit', async () => {
        qb.setOffset(5).setLimit(10).sortBy({ field: 'id', order: 'ASC' });
        const res = await request(server)
          .get('/users')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: expect.any(Array),
          count: 10,
          total: 21,
          page: 1,
          pageCount: 3,
          limit: 10,
        });
        expect(res.body.data).toHaveLength(10);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 6 }));
      });
      it('should respect maxLimit in pagination metadata', async () => {
        qb.setPage(1);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: expect.any(Array),
          count: 5,
          total: 8,
          page: 1,
          pageCount: 2,
          limit: 5,
        });
        expect(res.body.data).toHaveLength(5);
      });
      it('should paginate filtered results', async () => {
        qb.setFilter({ field: 'isActive', operator: 'eq', value: true })
          .setLimit(3)
          .setPage(2)
          .sortBy({ field: 'id', order: 'ASC' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual({
          data: [
            expect.objectContaining({ id: 4 }),
            expect.objectContaining({ id: 5 }),
            expect.objectContaining({ id: 6 }),
          ],
          count: 3,
          total: 10,
          page: 2,
          pageCount: 4,
          limit: 3,
        });
      });
    });

    describe('#sort', () => {
      it('should sort by field', async () => {
        qb.sortBy({ field: 'id', order: 'DESC' });
        const res = await request(server)
          .get('/users')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 21 }));
        expect(res.body.data[1]).toEqual(expect.objectContaining({ id: 20 }));
      });

      it('should throw 400 if SQL injection has been detected', async () => {
        qb.sortBy({
          field: ' ASC; SELECT CAST( version() AS INTEGER); --',
          order: 'DESC',
        });
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject);
        expect(res.status).toBeGreaterThanOrEqual(400);
      });

      it('should sort ASC by field', async () => {
        qb.sortBy({ field: 'id', order: 'ASC' });
        const res = await request(server)
          .get('/users')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
        expect(res.body.data[1]).toEqual(expect.objectContaining({ id: 2 }));
      });

      it('should sort by multiple fields', async () => {
        qb.sortBy([
          { field: 'companyId', order: 'ASC' },
          { field: 'id', order: 'DESC' },
        ]);
        const res = await request(server)
          .get('/projects2')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual(
          expect.objectContaining({ companyId: 1, id: 2 }),
        );
        expect(res.body.data[1]).toEqual(
          expect.objectContaining({ companyId: 1, id: 1 }),
        );
        expect(res.body.data[2]).toEqual(
          expect.objectContaining({ companyId: 2, id: 4 }),
        );
      });

      it('should sort combined with filter', async () => {
        qb.setFilter({
          field: 'isActive',
          operator: 'eq',
          value: true,
        }).sortBy({ field: 'id', order: 'DESC' });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(10);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 10 }));
        expect(res.body.data[9]).toEqual(expect.objectContaining({ id: 1 }));
      });

      it('should apply default @CrudSort when no sort param is set', async () => {
        qb.setLimit(5);
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
        expect(res.body.data[1]).toEqual(expect.objectContaining({ id: 2 }));
      });
    });

    describe('#search', () => {
      const projects2 = () => request(server).get('/projects2');
      const projects3 = () => request(server).get('/projects3');
      const projects4 = () => request(server).get('/projects4');

      it('should return with search, 1', async () => {
        const query = qb.search({ id: 1 }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 2', async () => {
        const query = qb.search({ id: 1, name: 'Project1' }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 3', async () => {
        const query = qb.search({ id: 1, name: { $eq: 'Project1' } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 4', async () => {
        const query = qb.search({ name: { $eq: 'Project1' } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 5', async () => {
        const query = qb.search({ id: { $nnull: true, $eq: 1 } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 6', async () => {
        const query = qb
          .search({ id: { $or: { $null: true, $eq: 1 } } })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 7', async () => {
        const query = qb.search({ id: { $or: { $eq: 1 } } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 8', async () => {
        const query = qb
          .search({ id: { $nnull: true, $or: { $eq: 1, $in: [30, 31] } } })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 9', async () => {
        const query = qb
          .search({ id: { $nnull: true, $or: { $eq: 1 } } })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
      });
      it('should return with search, 10', async () => {
        const query = qb.search({ id: null }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(0);
      });
      it('should return with search, 11', async () => {
        const query = qb
          .search({
            $and: [{ id: { $nin: [5, 6, 7, 8, 9, 10] } }, { isActive: true }],
          })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(4);
      });
      it('should return with search, 12', async () => {
        const query = qb
          .search({ $and: [{ id: { $nin: [5, 6, 7, 8, 9, 10] } }] })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(14);
      });
      it('should return with search, 13', async () => {
        const query = qb.search({ $or: [{ id: 54 }] }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(0);
      });
      it('should return with search, 14', async () => {
        const query = qb
          .search({ $or: [{ id: 54 }, { id: 33 }, { id: { $in: [1, 2] } }] })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(2);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 1 }));
        expect(res.body.data[1]).toEqual(expect.objectContaining({ id: 2 }));
      });
      it('should return with search, 15', async () => {
        const query = qb
          .search({ $or: [{ id: 54 }], name: 'Project1' })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(0);
      });
      it('should return with search, 16', async () => {
        const query = qb
          .search({ $or: [{ isActive: false }, { id: 3 }], name: 'Project3' })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 3 }));
      });
      it('should return with search, 17', async () => {
        const query = qb
          .search({
            $or: [{ isActive: false }, { id: { $eq: 3 } }],
            name: 'Project3',
          })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 3 }));
      });
      it('should return with search, 18', async () => {
        const query = qb
          .search({
            $or: [{ isActive: false }, { id: { $eq: 3 } }],
            name: { $eq: 'Project3' },
          })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 3 }));
      });
      it('should return with default filter, 1', async () => {
        const query = qb.search({ name: 'Project11' }).query();
        const res = await projects3().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 11 }));
      });
      it('should return with default filter, 2', async () => {
        const query = qb.search({ name: 'Project1' }).query();
        const res = await projects3().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(0);
      });
      it('should return with default filter, 3', async () => {
        const query = qb.search({ name: 'Project2' }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 2 }));
      });
      it('should return with default filter, 4', async () => {
        const query = qb.search({ name: 'Project11' }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body.data).toBeArrayOfSize(0);
      });
      it('should search by display column name, but use dbName in sql query', async () => {
        const query = qb.search({ revisionId: 2 }).query();
        const res = await request(server)
          .get('/notes')
          .query(query)
          .expect(200);
        expect(res.body.data).toBeArrayOfSize(2);
        expect(res.body.data[0]).toEqual(
          expect.objectContaining({ revisionId: 2 }),
        );
        expect(res.body.data[1]).toEqual(
          expect.objectContaining({ revisionId: 2 }),
        );
      });
      it('should paginate search results', async () => {
        const query = qb
          .search({ isActive: true })
          .setLimit(3)
          .setPage(2)
          .sortBy({ field: 'id', order: 'ASC' })
          .query();
        const res = await request(server)
          .get('/projects2')
          .query(query)
          .expect(200);
        expect(res.body).toEqual({
          data: [
            expect.objectContaining({ id: 4 }),
            expect.objectContaining({ id: 5 }),
            expect.objectContaining({ id: 6 }),
          ],
          count: 3,
          total: 10,
          page: 2,
          pageCount: 4,
          limit: 3,
        });
      });
    });

    describe('#field selection', () => {
      it('should return only selected fields', async () => {
        qb.select(['id', 'name']);
        const res = await request(server)
          .get('/projects2')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toEqual({
          id: expect.any(Number),
          name: expect.any(String),
        });
      });
      it('should return selected fields combined with filter', async () => {
        qb.select(['id', 'email']).setFilter({
          field: 'companyId',
          operator: 'eq',
          value: 1,
        });
        const res = await request(server)
          .get('/users')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(10);
        expect(res.body.data[0]).toEqual({
          id: expect.any(Number),
          email: expect.any(String),
        });
      });
    });

    describe('#exclude and allow', () => {
      it('should exclude updatedAt from company list response', async () => {
        qb.setLimit(1);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toEqual({
          id: expect.any(Number),
          name: expect.any(String),
          domain: expect.any(String),
          description: null,
        });
      });
      it('should only return allowed fields in company list response', async () => {
        qb.setLimit(1);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual({
          id: expect.any(Number),
          name: expect.any(String),
          domain: expect.any(String),
          description: null,
        });
      });
      it('should have all response fields when no exclude or allow decorators', async () => {
        qb.setLimit(1);
        const res = await request(server)
          .get('/projects2')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body.data[0]).toEqual({
          id: expect.any(Number),
          name: expect.any(String),
          description: expect.any(String),
          isActive: expect.any(Boolean),
          companyId: expect.any(Number),
        });
      });
    });

    describe('#includeDeleted', () => {
      it('should return soft-deleted companies when includeDeleted is set', async () => {
        qb.setIncludeDeleted(1);
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual(expect.objectContaining({ total: 9 }));
      });
      it('should not return soft-deleted companies by default', async () => {
        const res = await request(server)
          .get('/companies')
          .query(qb.queryObject)
          .expect(200);
        expect(res.body).toEqual(expect.objectContaining({ total: 8 }));
        const ids = res.body.data.map((c: { id: number }) => c.id);
        expect(ids).not.toContain(9);
      });
    });

    describe('#error cases', () => {
      it('should return error for invalid sort order', async () => {
        const res = await request(server).get('/projects?sort=id,INVALID');
        expect(res.status).toBeGreaterThanOrEqual(400);
      });
      it('should return error for malformed search JSON', async () => {
        const res = await request(server).get('/projects2?s=not-valid-json');
        expect(res.status).toBeGreaterThanOrEqual(400);
      });
      it('should return error for invalid filter field', async () => {
        qb.setFilter({
          field: 'nonexistent',
          operator: 'eq',
          value: 'test',
        });
        const res = await request(server)
          .get('/projects')
          .query(qb.queryObject);
        expect(res.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('#search and filter mutual exclusion', () => {
      it('should ignore filter when search is set', async () => {
        qb.setFilter({ field: 'isActive', operator: 'eq', value: true });
        qb.search({ id: 11 });
        const query = qb.query();
        const res = await request(server)
          .get('/projects2')
          .query(query)
          .expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(
          expect.objectContaining({ id: 11, isActive: false }),
        );
      });
      it('should ignore or-condition when search is set', async () => {
        qb.setOr({ field: 'companyId', operator: 'eq', value: 1 });
        qb.search({ id: 20 });
        const query = qb.query();
        const res = await request(server)
          .get('/projects2')
          .query(query)
          .expect(200);
        expect(res.body.data).toBeArrayOfSize(1);
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 20 }));
      });
    });

    describe('#update', () => {
      it('should update company id of project', async () => {
        await request(server)
          .patch('/projects/18')
          .send({ companyId: 10 })
          .expect(200);

        const modified = await request(server).get('/projects/18').expect(200);

        expect(modified.body).toEqual(
          expect.objectContaining({ id: 18, companyId: 10 }),
        );
      });
    });
  });
});
