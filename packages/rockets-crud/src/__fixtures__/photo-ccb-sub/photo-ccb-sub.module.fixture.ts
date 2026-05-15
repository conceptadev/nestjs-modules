import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

import { CRUD_TEST_PHOTO_CCB_SUB_ENTITY_NAME } from '../crud-test.constants';
import { PhotoFixture } from '../photo/photo.entity.fixture';

import {
  PhotoCcbSubControllerFixture,
  PhotoCcbSubProviders,
} from './photo-ccb-sub.controller.fixture';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: CRUD_TEST_PHOTO_CCB_SUB_ENTITY_NAME, entity: PhotoFixture },
      ],
    }),
  ],
  providers: PhotoCcbSubProviders,
  controllers: [PhotoCcbSubControllerFixture],
})
export class PhotoCcbSubModuleFixture {}
