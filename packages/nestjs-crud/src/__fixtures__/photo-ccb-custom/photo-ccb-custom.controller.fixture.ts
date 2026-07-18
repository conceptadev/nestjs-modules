import { Inject } from '@nestjs/common';

import { Ctx } from '@concepta/nestjs-core';

import { CrudController } from '../../infrastructure/decorators/controller/crud-controller.decorator.js';
import { CrudCreateBatch } from '../../infrastructure/decorators/operations/crud-create-batch.decorator.js';
import { CrudCreate } from '../../infrastructure/decorators/operations/crud-create.decorator.js';
import { CrudDelete } from '../../infrastructure/decorators/operations/crud-delete.decorator.js';
import { CrudList } from '../../infrastructure/decorators/operations/crud-list.decorator.js';
import { CrudRead } from '../../infrastructure/decorators/operations/crud-read.decorator.js';
import { CrudReplace } from '../../infrastructure/decorators/operations/crud-replace.decorator.js';
import { CrudRestore } from '../../infrastructure/decorators/operations/crud-restore.decorator.js';
import { CrudSoftDelete } from '../../infrastructure/decorators/operations/crud-soft-delete.decorator.js';
import { CrudUpdate } from '../../infrastructure/decorators/operations/crud-update.decorator.js';
import { CrudBody } from '../../infrastructure/decorators/params/crud-body.decorator.js';
import { CrudCtx } from '../../infrastructure/interceptors/crud-context.overlay.js';
import { CrudContextInterface } from '../../infrastructure/interceptors/interfaces/crud-context.interface.js';
import { CrudAdapterResolver } from '../../infrastructure/resolvers/crud-adapter.resolver.js';
import { CrudResolverInterface } from '../../infrastructure/resolvers/interfaces/crud-resolver.interface.js';
import { ConfigurableCrudBuilder } from '../../infrastructure/utils/configurable-crud.builder.js';
import { CRUD_TEST_PHOTO_CCB_CUSTOM_ENTITY_NAME } from '../crud-test.constants.js';
import { PhotoCreateBatchDtoFixture } from '../photo/dto/photo-create-batch.dto.fixture.js';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture.js';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture.js';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture.js';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture.js';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture.js';

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
