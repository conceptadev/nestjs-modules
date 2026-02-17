import request from 'supertest';
import { DataSource } from 'typeorm';

import { Inject, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionsFilter, Ctx } from '@concepta/nestjs-common';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import {
  CRUD_TEST_COMPANY_ENTITY_NAME,
  CRUD_TEST_USER_ENTITY_NAME,
  CRUD_TEST_USER_PROFILE_ENTITY_NAME,
} from '../../__fixtures__/crud-test.constants';
import { CompanyEntity } from '../../__fixtures__/typeorm/company/company.entity';
import { ormSqliteConfig } from '../../__fixtures__/typeorm/orm.sqlite.config';
import { Seeds } from '../../__fixtures__/typeorm/seeds';
import { UserProfileEntity } from '../../__fixtures__/typeorm/user-profile/user-profile.entity';
import { UserEntity } from '../../__fixtures__/typeorm/users/user.entity';
import { CrudAdapter } from '../../crud/adapters/crud.adapter';
import { CrudController } from '../../crud/decorators/controller/crud-controller.decorator';
import { CrudList } from '../../crud/decorators/operations/crud-list.decorator';
import { CrudRead } from '../../crud/decorators/operations/crud-read.decorator';
import { CrudLimit } from '../../crud/decorators/routes/crud-limit.decorator';
import { CrudRelations } from '../../crud/decorators/routes/crud-relations.decorator';
import { CrudSort } from '../../crud/decorators/routes/crud-sort.decorator';
import { CrudContextInterface } from '../../crud/interfaces/crud-context.interface';
import { CrudResolverInterface } from '../../crud/interfaces/crud-resolver.interface';
import { CrudListQuery } from '../../crud/operations/queries/crud-list.query';
import { CrudReadQuery } from '../../crud/operations/queries/crud-read.query';
import { CrudAdapterResolver } from '../../crud/resolvers/crud-adapter.resolver';
import { CrudModule } from '../../crud.module';
import { createCrudAdapterProvider } from '../../util/create-crud-adapter-provider';

// tslint:disable:max-classes-per-file no-shadowed-variable
describe.skip('#crud-typeorm', () => {
  describe('#basic crud respects global limit', () => {
    let app: INestApplication;
    let server: ReturnType<INestApplication['getHttpServer']>;

    @CrudController({
      path: 'companies0',
      entity: CRUD_TEST_COMPANY_ENTITY_NAME,
      adapter: CrudAdapter,
    })
    @CrudLimit(3)
    @CrudSort([{ field: 'id', order: 'ASC' }])
    @CrudRelations<CompanyEntity, [UserEntity]>({
      rootKey: 'id',
      relations: [
        {
          join: 'INNER',
          cardinality: 'many',
          entity: CRUD_TEST_USER_ENTITY_NAME,
          property: 'users',
          primaryKey: 'id',
          foreignKey: 'companyId',
        },
      ],
    })
    class CompaniesController0 {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: CrudListQuery })
      list(@Ctx() context: CrudContextInterface<CompanyEntity>) {
        return this.crudResolver.list(context);
      }
    }

    @CrudController({
      path: 'users',
      entity: CRUD_TEST_USER_ENTITY_NAME,
      adapter: CrudAdapter,
    })
    @CrudSort([{ field: 'id', order: 'ASC' }])
    @CrudRelations<UserEntity, [UserProfileEntity]>({
      rootKey: 'id',
      relations: [
        {
          cardinality: 'one',
          entity: CRUD_TEST_USER_PROFILE_ENTITY_NAME,
          property: 'userProfile',
          primaryKey: 'id',
          foreignKey: 'userId',
        },
      ],
    })
    class UsersController {
      constructor(
        @Inject(CrudAdapterResolver)
        public crudResolver: CrudResolverInterface,
      ) {}

      @CrudList({ query: CrudListQuery })
      list(@Ctx() context: CrudContextInterface<UserEntity>) {
        return this.crudResolver.list(context);
      }

      @CrudRead({ query: CrudReadQuery })
      read(@Ctx() context: CrudContextInterface<UserEntity>) {
        return this.crudResolver.read(context);
      }
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(ormSqliteConfig),
          RepositoryModule.forRoot({}),
          RepositoryModule.forFeature({
            module: TypeOrmRepositoryModule,
            entities: [
              { key: CRUD_TEST_COMPANY_ENTITY_NAME, entity: CompanyEntity },
              { key: CRUD_TEST_USER_ENTITY_NAME, entity: UserEntity },
              {
                key: CRUD_TEST_USER_PROFILE_ENTITY_NAME,
                entity: UserProfileEntity,
              },
            ],
          }),
          CrudModule.forRoot({}),
        ],
        controllers: [CompaniesController0, UsersController],
        providers: [
          { provide: APP_FILTER, useClass: ExceptionsFilter },
          createCrudAdapterProvider({
            entity: CRUD_TEST_COMPANY_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          createCrudAdapterProvider({
            entity: CRUD_TEST_USER_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
          createCrudAdapterProvider({
            entity: CRUD_TEST_USER_PROFILE_ENTITY_NAME,
            adapter: CrudAdapter,
          }),
        ],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();

      const datasource = app.get<DataSource>(getDataSourceToken());
      const seeds = new Seeds();
      await seeds.up(datasource.createQueryRunner());
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#getAll', () => {
      it('should return an array of all company entities', (done) => {
        request(server)
          .get(
            '/companies0?filter=name||$starts||Name&filter=users.isActive||$eq||true',
          )
          .end((_, res) => {
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(3);
            expect(res.body.page).toBe(1);
            done();
          });
      });
      it.only('should return an array of all user entities', (done) => {
        request(server)
          .get(
            // '/users?sort[]=userProfile.nickName,DESC&page=2&limit=10',
            '/users?filter[]=email||$starts||5&filter[]=userProfile.favoriteColor||$eq||Orange&page=1&limit=10',
            // '/users?sort[]=email,DESC&page=1&limit=10',
          )
          .end((_, res) => {
            expect(res.status).toBe(200);
            expect(res.body.data).toBe({});
            done();
          });
      });
      it('should return one user entity', (done) => {
        request(server)
          .get('/users/1')
          .end((_, res) => {
            expect(res.status).toBe(200);
            expect(res.body).toBe({});
            done();
          });
      });
    });
  });
});
