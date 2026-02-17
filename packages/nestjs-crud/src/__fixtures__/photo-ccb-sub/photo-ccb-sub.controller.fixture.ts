import { Inject } from '@nestjs/common';

import { Ctx } from '@concepta/nestjs-common';

import { CrudController } from '../../crud/decorators/controller/crud-controller.decorator';
import { CrudCreateBatch } from '../../crud/decorators/operations/crud-create-batch.decorator';
import { CrudCreate } from '../../crud/decorators/operations/crud-create.decorator';
import { CrudDelete } from '../../crud/decorators/operations/crud-delete.decorator';
import { CrudList } from '../../crud/decorators/operations/crud-list.decorator';
import { CrudRead } from '../../crud/decorators/operations/crud-read.decorator';
import { CrudReplace } from '../../crud/decorators/operations/crud-replace.decorator';
import { CrudRestore } from '../../crud/decorators/operations/crud-restore.decorator';
import { CrudSoftDelete } from '../../crud/decorators/operations/crud-soft-delete.decorator';
import { CrudUpdate } from '../../crud/decorators/operations/crud-update.decorator';
import { CrudBody } from '../../crud/decorators/params/crud-body.decorator';
import { CrudContextInterface } from '../../crud/interfaces/crud-context.interface';
import { CrudCreateBatchInterface } from '../../crud/interfaces/crud-create-batch.interface';
import { CrudResolverInterface } from '../../crud/interfaces/crud-resolver.interface';
import { CrudAdapterResolver } from '../../crud/resolvers/crud-adapter.resolver';
import { ConfigurableCrudBuilder } from '../../util/configurable-crud.builder';
import { CRUD_TEST_PHOTO_CCB_SUB_ENTITY_NAME } from '../crud-test.constants';
import { PhotoCreateBatchDtoFixture } from '../photo/dto/photo-create-batch.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoCreatableInterfaceFixture } from '../photo/interfaces/photo-creatable.interface.fixture';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';
import { PhotoUpdatableInterfaceFixture } from '../photo/interfaces/photo-updatable.interface.fixture';

@CrudController({
  path: 'photo',
  entity: CRUD_TEST_PHOTO_CCB_SUB_ENTITY_NAME,
  request: { body: PhotoDtoFixture },
  response: { resource: PhotoDtoFixture, paginated: PhotoPaginatedDtoFixture },
})
export class PhotoCcbSubControllerFixture {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudList()
  async list(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.list(crudContext);
  }

  @CrudRead()
  async read(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.read(crudContext);
  }

  @CrudCreateBatch({ request: { bodyBatch: PhotoCreateBatchDtoFixture } })
  async createBatch(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: CrudCreateBatchInterface<PhotoCreatableInterfaceFixture>,
  ) {
    return this.crudResolver.createBatch(crudContext, dto);
  }

  @CrudCreate({ request: { body: PhotoCreateDtoFixture } })
  async create(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoCreatableInterfaceFixture,
  ) {
    return this.crudResolver.create(crudContext, dto);
  }

  @CrudUpdate({ request: { body: PhotoUpdateDtoFixture } })
  async update(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoUpdatableInterfaceFixture,
  ) {
    return this.crudResolver.update(crudContext, dto);
  }

  @CrudReplace({ request: { body: PhotoUpdateDtoFixture } })
  async replace(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoUpdatableInterfaceFixture,
  ) {
    return this.crudResolver.replace(crudContext, dto);
  }

  @CrudDelete()
  async delete(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.delete(crudContext);
  }

  @CrudSoftDelete({ path: 'soft/:id' })
  async softDelete(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.softDelete(crudContext);
  }

  @CrudRestore({ path: 'restore/:id' })
  async restore(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.restore(crudContext);
  }
}

// Use controller.class path to generate handlers from the decorated class
const crudBuilder = new ConfigurableCrudBuilder<PhotoEntityInterfaceFixture>({
  controller: {
    class: PhotoCcbSubControllerFixture,
  },
});

export const PhotoCcbSubProviders = crudBuilder.build().providers;
