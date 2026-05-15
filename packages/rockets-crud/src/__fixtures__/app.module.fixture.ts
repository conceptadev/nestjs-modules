import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RepositoryModule } from '@concepta/rockets-repository';

import { default as ormConfig } from './ormconfig.fixture';
import { PhotoModuleFixture } from './photo/photo.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RepositoryModule.forRoot({}),
    PhotoModuleFixture.register(),
  ],
})
export class AppModuleFixture {}
