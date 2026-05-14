import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';
import { ExceptionsFilter } from '@concepta/rockets-app';

import { CacheModule } from '../../cache.module';

import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    RepositoryModule.forRoot({}),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [{ key: 'userCache', entity: UserCacheEntityFixture }],
    }),
    CacheModule.forRoot({}),
    CacheModule.forFeature(['userCache']),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppModuleFixture {}
