import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { CrudModule } from '../crud.module';
import { CrudCqrsResolver } from '../infrastructure/resolvers/crud-cqrs.resolver';

import { default as ormConfig } from './ormconfig.fixture';
import { PhotoCcbModuleFixture } from './photo-ccb/photo-ccb.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    CqrsModule.forRoot(),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    PhotoCcbModuleFixture,
  ],
})
export class AppResolverCqrsModuleFixture {}
