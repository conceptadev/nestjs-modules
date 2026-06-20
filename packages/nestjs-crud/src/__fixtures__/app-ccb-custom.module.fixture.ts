import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/nestjs-repository';

import { CrudModule } from '../crud.module';

import { PhotoCcbCustomModuleFixture } from './photo-ccb-custom/photo-ccb-custom.module.fixture';

@Module({
  imports: [
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({}),
    PhotoCcbCustomModuleFixture,
  ],
})
export class AppCcbCustomModuleFixture {}
