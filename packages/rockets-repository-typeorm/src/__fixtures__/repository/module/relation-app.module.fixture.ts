import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { relationOrmConfig } from '../config/relation-ormconfig.fixture';

import { RelationTestModuleFixture } from './relation-test.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(relationOrmConfig),
    RepositoryModule.forRoot({}),
    RelationTestModuleFixture,
  ],
})
export class RelationAppModuleFixture {}
