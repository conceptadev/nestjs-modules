import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CrudModule } from '../crud.module';

import { default as ormConfig } from './ormconfig.fixture';
import { PhotoCcbUseClassModuleFixture } from './photo-ccb-useclass/photo-ccb-useclass.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    PhotoCcbUseClassModuleFixture,
  ],
})
export class AppCcbUseClassModuleFixture {}
