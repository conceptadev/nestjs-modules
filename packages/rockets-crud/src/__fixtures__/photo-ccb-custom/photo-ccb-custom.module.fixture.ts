import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

import { CRUD_TEST_PHOTO_CCB_CUSTOM_ENTITY_NAME } from '../crud-test.constants';
import { PhotoFixture } from '../photo/photo.entity.fixture';

import {
  PhotoCcbCustomControllerFixture,
  PhotoCcbCustomProviders,
} from './photo-ccb-custom.controller.fixture';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: CRUD_TEST_PHOTO_CCB_CUSTOM_ENTITY_NAME, entity: PhotoFixture },
      ],
    }),
  ],
  providers: PhotoCcbCustomProviders,
  controllers: [PhotoCcbCustomControllerFixture],
})
export class PhotoCcbCustomModuleFixture {}
