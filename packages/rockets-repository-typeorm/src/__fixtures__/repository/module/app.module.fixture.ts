import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { ormConfig } from '../config/ormconfig.fixture';

import { TestModuleFixture } from './test.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    TestModuleFixture,
  ],
})
export class AppModuleFixture {}
