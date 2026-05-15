import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { CrudModule } from '../crud.module';
import { CrudOperationResolver } from '../infrastructure/resolvers/crud-operation.resolver';

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
