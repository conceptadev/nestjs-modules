import { Inject, Injectable } from '@nestjs/common';

import { CrudAdapter } from '../../crud/adapters/crud.adapter';
import { CrudSoftDelete } from '../../crud/decorators/routes/crud-soft-delete.decorator';
import { CrudService } from '../../services/crud.service';
import { ConfigurableCrudBuilder } from '../../util/configurable-crud.builder';
import { PhotoCreateManyDtoFixture } from '../photo/dto/photo-create-many.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoCreatableInterfaceFixture } from '../photo/interfaces/photo-creatable.interface.fixture';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';
import { PhotoUpdatableInterfaceFixture } from '../photo/interfaces/photo-updatable.interface.fixture';
import { PhotoTypeOrmCrudAdapterFixture } from '../photo/photo-typeorm-crud.adapter.fixture';

export const PHOTO_USECLASS_SERVICE_TOKEN = Symbol(
  '__PHOTO_USECLASS_SERVICE_TOKEN__',
);

/**
 * Custom service class that will be passed via useClass option
 * Has a custom method to verify it's being used
 */
@Injectable()
export class PhotoUseClassCrudServiceFixture extends CrudService<PhotoEntityInterfaceFixture> {
  constructor(
    @Inject(PhotoTypeOrmCrudAdapterFixture)
    protected readonly crudAdapter: CrudAdapter<PhotoEntityInterfaceFixture>,
  ) {
    super(crudAdapter);
  }

  /**
   * Custom method to verify this service is being used
   */
  customServiceMethod(): string {
    return 'custom-service-used';
  }
}

const crudBuilder = new ConfigurableCrudBuilder<
  PhotoEntityInterfaceFixture,
  PhotoCreatableInterfaceFixture,
  PhotoUpdatableInterfaceFixture
>({
  service: {
    useClass: PhotoUseClassCrudServiceFixture,
    serviceToken: PHOTO_USECLASS_SERVICE_TOKEN,
  },
  controller: {
    path: 'photo',
    model: {
      type: PhotoDtoFixture,
      paginatedType: PhotoPaginatedDtoFixture,
    },
  },
  getMany: {},
  getOne: {},
  createMany: {
    dto: PhotoCreateManyDtoFixture,
  },
  createOne: {
    dto: PhotoCreateDtoFixture,
  },
  updateOne: {
    dto: PhotoUpdateDtoFixture,
  },
  replaceOne: {
    dto: PhotoUpdateDtoFixture,
  },
  deleteOne: {
    extraDecorators: [CrudSoftDelete(true)],
  },
  recoverOne: { path: 'recover/:id' },
});

const {
  ConfigurableControllerClass,
  ConfigurableServiceClass,
  ConfigurableServiceProvider,
} = crudBuilder.build();

// Verify that ConfigurableServiceClass is the same as our custom class
export const serviceClassIsCustom =
  ConfigurableServiceClass === PhotoUseClassCrudServiceFixture;

// Export the provider for module registration
export { ConfigurableServiceProvider as PhotoUseClassServiceProvider };

export class PhotoCcbUseClassControllerFixture extends ConfigurableControllerClass {}
