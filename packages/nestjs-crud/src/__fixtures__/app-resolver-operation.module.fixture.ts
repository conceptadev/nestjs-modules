import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/nestjs-repository';

import { CrudModule } from '../crud.module';
import { CrudOperationResolver } from '../infrastructure/resolvers/crud-operation.resolver';

import { PhotoCcbModuleFixture } from './photo-ccb/photo-ccb.module.fixture';

@Module({
  imports: [
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudOperationResolver,
    }),
    PhotoCcbModuleFixture,
  ],
})
export class AppResolverOperationModuleFixture {}
