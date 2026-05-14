import { Operation } from '@concepta/rockets-app';

import { ConfigurableCrudBuilder } from '../../infrastructure/utils/configurable-crud.builder';
import { CRUD_TEST_PHOTO_CCB_ENTITY_NAME } from '../crud-test.constants';
import { PhotoCreateBatchDtoFixture } from '../photo/dto/photo-create-batch.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';

const crudBuilder = new ConfigurableCrudBuilder<PhotoEntityInterfaceFixture>({
  controller: {
    path: 'photo',
    entity: CRUD_TEST_PHOTO_CCB_ENTITY_NAME,
    request: { body: PhotoDtoFixture },
    response: {
      resource: PhotoDtoFixture,
      paginated: PhotoPaginatedDtoFixture,
    },
  },
  operations: [
    { operation: Operation.List },
    { operation: Operation.Read },
    {
      operation: Operation.CreateBatch,
      request: { bodyBatch: PhotoCreateBatchDtoFixture },
    },
    {
      operation: Operation.Create,
      request: { body: PhotoCreateDtoFixture },
    },
    {
      operation: Operation.Update,
      request: { body: PhotoUpdateDtoFixture },
    },
    {
      operation: Operation.Replace,
      request: { body: PhotoUpdateDtoFixture },
    },
    { operation: Operation.Delete },
    { operation: Operation.SoftDelete, path: 'soft/:id' },
    { operation: Operation.Restore, path: 'restore/:id' },
  ],
});

const { controllers, providers } = crudBuilder.build();
const { PhotoCcbController } = controllers;

export class PhotoCcbControllerFixture extends PhotoCcbController {}

export { providers as PhotoCcbProviders };
