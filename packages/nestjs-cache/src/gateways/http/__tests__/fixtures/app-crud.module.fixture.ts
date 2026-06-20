import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule, ExceptionsFilter, Operation } from '@concepta/nestjs-core';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import { UserCacheEntityFixture } from '../../../../__tests__/fixtures/entities/user-cache-entity.fixture';
import { UserEntityFixture } from '../../../../__tests__/fixtures/entities/user-entity.fixture';
import { CACHE_MODULE_CACHE_ENTITY_KEY } from '../../../../cache.constants';
import { CacheModule } from '../../../../cache.module';
import { CacheInterface } from '../../../../domain/interfaces/cache.interface';
import { CacheNamespace } from '../../../../gateways/decorators/cache-namespace.decorator';
import { CacheCreateDto } from '../../../../infrastructure/dtos/cache-create.dto';
import { CachePaginatedDto } from '../../../../infrastructure/dtos/cache-paginated.dto';
import { CacheUpdateDto } from '../../../../infrastructure/dtos/cache-update.dto';
import { CacheDto } from '../../../../infrastructure/dtos/cache.dto';
import { CreateCacheRequestHandler } from '../../commands/handlers/create-cache-request.handler';
import { DeleteCacheRequestHandler } from '../../commands/handlers/delete-cache-request.handler';
import { ReplaceCacheRequestHandler } from '../../commands/handlers/replace-cache-request.handler';
import { UpdateCacheRequestHandler } from '../../commands/handlers/update-cache-request.handler';
import { CreateCacheRequest } from '../../commands/impl/create-cache.request';
import { DeleteCacheRequest } from '../../commands/impl/delete-cache.request';
import { ReplaceCacheRequest } from '../../commands/impl/replace-cache.request';
import { UpdateCacheRequest } from '../../commands/impl/update-cache.request';
import { ListCachesRequestHandler } from '../../queries/handlers/list-caches-request.handler';
import { ReadCacheRequestHandler } from '../../queries/handlers/read-cache-request.handler';
import { ListCachesRequest } from '../../queries/impl/list-caches.request';
import { ReadCacheRequest } from '../../queries/impl/read-cache.request';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    CqrsModule.forRoot(),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    CoreModule.forRoot(),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: CACHE_MODULE_CACHE_ENTITY_KEY, entity: UserCacheEntityFixture },
      ],
    }),
    CacheModule.forRoot({
      settings: {
        expiresIn: '1h',
      },
    }),
    CacheModule.forFeature([CACHE_MODULE_CACHE_ENTITY_KEY]),
    CrudModule.forFeature<CacheInterface>({
      crud: {
        controller: {
          entity: CACHE_MODULE_CACHE_ENTITY_KEY,
          path: 'cache/user',
          resolver: CrudCqrsResolver,
          transactional: true,
          extraDecorators: [
            CacheNamespace({ name: CACHE_MODULE_CACHE_ENTITY_KEY }),
          ],
          request: { body: CacheCreateDto },
          response: {
            resource: CacheDto,
            paginated: CachePaginatedDto,
          },
        },
        operations: [
          {
            operation: Operation.List,
            query: ListCachesRequest,
            queryHandler: ListCachesRequestHandler,
          },
          {
            operation: Operation.Read,
            query: ReadCacheRequest,
            queryHandler: ReadCacheRequestHandler,
          },
          {
            operation: Operation.Create,
            request: { body: CacheCreateDto },
            command: CreateCacheRequest,
            commandHandler: CreateCacheRequestHandler,
          },
          {
            operation: Operation.Update,
            request: { body: CacheUpdateDto },
            command: UpdateCacheRequest,
            commandHandler: UpdateCacheRequestHandler,
          },
          {
            operation: Operation.Replace,
            request: { body: CacheCreateDto },
            command: ReplaceCacheRequest,
            commandHandler: ReplaceCacheRequestHandler,
          },
          {
            operation: Operation.Delete,
            command: DeleteCacheRequest,
            commandHandler: DeleteCacheRequestHandler,
          },
        ],
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppCrudModuleFixture {}
