import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/nestjs-repository';

import { CrudOperationResolver } from '../crud/resolvers/crud-operation.resolver';
import { CrudModule } from '../crud.module';

import { default as ormConfig } from './ormconfig.fixture';
import { PhotoCcbModuleFixture } from './photo-ccb/photo-ccb.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudOperationResolver,
    }),
    PhotoCcbModuleFixture,
  ],
})
export class AppResolverOperationModuleFixture {}
