import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { CrudModule } from '../crud.module';

import { default as ormConfig } from './ormconfig.fixture';
import { PhotoCcbSubModuleFixture } from './photo-ccb-sub/photo-ccb-sub.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({}),
    PhotoCcbSubModuleFixture,
  ],
})
export class AppCcbSubModuleFixture {}
