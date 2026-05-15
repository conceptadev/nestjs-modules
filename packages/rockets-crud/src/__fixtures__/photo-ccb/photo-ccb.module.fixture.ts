import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

import { CRUD_TEST_PHOTO_CCB_ENTITY_NAME } from '../crud-test.constants';
import { PhotoFixture } from '../photo/photo.entity.fixture';

import {
  PhotoCcbControllerFixture,
  PhotoCcbProviders,
} from './photo-ccb.controller.fixture';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: CRUD_TEST_PHOTO_CCB_ENTITY_NAME, entity: PhotoFixture },
      ],
    }),
  ],
  providers: PhotoCcbProviders,
  controllers: [PhotoCcbControllerFixture],
})
export class PhotoCcbModuleFixture {}
