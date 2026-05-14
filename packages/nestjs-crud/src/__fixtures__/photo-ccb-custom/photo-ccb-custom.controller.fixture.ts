import { Inject } from '@nestjs/common';

import { Ctx } from '@concepta/rockets-app';

import { CrudController } from '../../infrastructure/decorators/controller/crud-controller.decorator';
import { CrudCreateBatch } from '../../infrastructure/decorators/operations/crud-create-batch.decorator';
import { CrudCreate } from '../../infrastructure/decorators/operations/crud-create.decorator';
import { CrudDelete } from '../../infrastructure/decorators/operations/crud-delete.decorator';
import { CrudList } from '../../infrastructure/decorators/operations/crud-list.decorator';
import { CrudRead } from '../../infrastructure/decorators/operations/crud-read.decorator';
import { CrudReplace } from '../../infrastructure/decorators/operations/crud-replace.decorator';
import { CrudRestore } from '../../infrastructure/decorators/operations/crud-restore.decorator';
import { CrudSoftDelete } from '../../infrastructure/decorators/operations/crud-soft-delete.decorator';
import { CrudUpdate } from '../../infrastructure/decorators/operations/crud-update.decorator';
import { CrudBody } from '../../infrastructure/decorators/params/crud-body.decorator';
import { CrudCtx } from '../../infrastructure/interceptors/crud-context.overlay';
import { CrudContextInterface } from '../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudAdapterResolver } from '../../infrastructure/resolvers/crud-adapter.resolver';
import { CrudResolverInterface } from '../../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { ConfigurableCrudBuilder } from '../../infrastructure/utils/configurable-crud.builder';
import { CRUD_TEST_PHOTO_CCB_CUSTOM_ENTITY_NAME } from '../crud-test.constants';
import { PhotoCreateBatchDtoFixture } from '../photo/dto/photo-create-batch.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';

@CrudController({
  path: 'photo',
  entity: CRUD_TEST_PHOTO_CCB_CUSTOM_ENTITY_NAME,
  request: { body: PhotoDtoFixture },
  response: { resource: PhotoDtoFixture, paginated: PhotoPaginatedDtoFixture },
})
export class PhotoCcbCustomControllerFixture {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudList()
  async list(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.list(ctx);
  }

  @CrudRead()
  async read(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.read(ctx);
  }

  @CrudCreateBatch()
  async createBatch(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoCreateBatchDtoFixture,
  ) {
    return this.crudResolver.createBatch(ctx, dto);
  }

  @CrudCreate({ request: { body: PhotoCreateDtoFixture } })
  async create(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoCreateDtoFixture,
  ) {
    return this.crudResolver.create(ctx, dto);
  }

  @CrudUpdate({ request: { body: PhotoUpdateDtoFixture } })
  async update(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoUpdateDtoFixture,
  ) {
    return this.crudResolver.update(ctx, dto);
  }

  @CrudReplace({ request: { body: PhotoUpdateDtoFixture } })
  async replace(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() dto: PhotoUpdateDtoFixture,
  ) {
    return this.crudResolver.replace(ctx, dto);
  }

  @CrudDelete()
  async delete(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.delete(ctx);
  }

  @CrudSoftDelete({ path: 'soft/:id' })
  async softDelete(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.softDelete(ctx);
  }

  @CrudRestore({ path: 'restore/:id' })
  async restore(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.restore(ctx);
  }
}

// Use controller.class path to generate handlers from the decorated class
const crudBuilder = new ConfigurableCrudBuilder<PhotoEntityInterfaceFixture>({
  controller: {
    class: PhotoCcbCustomControllerFixture,
  },
});

export const PhotoCcbCustomProviders = crudBuilder.build().providers;
