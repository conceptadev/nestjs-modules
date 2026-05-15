import { DynamicModule, Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

import { CrudModule } from '../../crud.module';
import { CRUD_TEST_PHOTO_ENTITY_NAME } from '../crud-test.constants';

import { PhotoEntityInterfaceFixture } from './interfaces/photo-entity.interface.fixture';
import { PhotoControllerFixture } from './photo.controller.fixture';
import { PhotoFixture } from './photo.entity.fixture';

@Module({})
export class PhotoModuleFixture {
  static register(): DynamicModule {
    return {
      module: PhotoModuleFixture,
      imports: [
        CrudModule.forRoot({}),
        CrudModule.forFeature<PhotoEntityInterfaceFixture>({
          crud: {
            controller: { class: PhotoControllerFixture },
          },
        }),
        RepositoryModule.forFeature({
          module: TypeOrmRepositoryModule,
          entities: [
            { key: CRUD_TEST_PHOTO_ENTITY_NAME, entity: PhotoFixture },
          ],
        }),
      ],
    };
  }
}
