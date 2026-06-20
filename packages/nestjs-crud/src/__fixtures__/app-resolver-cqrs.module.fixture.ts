import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RepositoryModule } from '@concepta/nestjs-repository';

import { CrudModule } from '../crud.module';
import { CrudCqrsResolver } from '../infrastructure/resolvers/crud-cqrs.resolver';

import { PhotoCcbModuleFixture } from './photo-ccb/photo-ccb.module.fixture';

@Module({
  imports: [
    RepositoryModule.forRoot({}),
    CqrsModule.forRoot(),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    PhotoCcbModuleFixture,
  ],
})
export class AppResolverCqrsModuleFixture {}
