import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/nestjs-repository';

import { CrudModule } from '../crud.module';

import { PhotoCcbSubModuleFixture } from './photo-ccb-sub/photo-ccb-sub.module.fixture';

@Module({
  imports: [
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({}),
    PhotoCcbSubModuleFixture,
  ],
})
export class AppCcbSubModuleFixture {}
