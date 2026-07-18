import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Ctx } from '@concepta/nestjs-core';

import { CrudCreateBatchCommand } from '../../application/commands/impl/crud-create-batch.command.js';
import { CrudCreateCommand } from '../../application/commands/impl/crud-create.command.js';
import { CrudDeleteCommand } from '../../application/commands/impl/crud-delete.command.js';
import { CrudReplaceCommand } from '../../application/commands/impl/crud-replace.command.js';
import { CrudRestoreCommand } from '../../application/commands/impl/crud-restore.command.js';
import { CrudSoftDeleteCommand } from '../../application/commands/impl/crud-soft-delete.command.js';
import { CrudUpdateCommand } from '../../application/commands/impl/crud-update.command.js';
import { CrudListQuery } from '../../application/queries/impl/crud-list.query.js';
import { CrudReadQuery } from '../../application/queries/impl/crud-read.query.js';
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

import { PhotoCreateBatchDtoFixture } from './dto/photo-create-batch.dto.fixture.js';
import { PhotoCreateDtoFixture } from './dto/photo-create.dto.fixture.js';
import { PhotoPaginatedDtoFixture } from './dto/photo-paginated.dto.fixture.js';
import { PhotoUpdateDtoFixture } from './dto/photo-update.dto.fixture.js';
import { PhotoDtoFixture } from './dto/photo.dto.fixture.js';
import { PhotoEntityInterfaceFixture } from './interfaces/photo-entity.interface.fixture.js';

/**
 * Photo controller.
 */
@CrudController({
  path: 'photo',
  entity: 'Photo',
  request: { body: PhotoDtoFixture },
  response: { resource: PhotoDtoFixture, paginated: PhotoPaginatedDtoFixture },
})
@ApiTags('photo')
export class PhotoControllerFixture {
  constructor(
    @Inject(CrudAdapterResolver)
    protected readonly crudResolver: CrudResolverInterface,
  ) {}

  @CrudList({ query: CrudListQuery })
  async list(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.list(ctx);
  }

  @CrudRead({ query: CrudReadQuery })
  async read(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.read(ctx);
  }

  @CrudCreateBatch({ command: CrudCreateBatchCommand })
  async createBatch(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateBatchDto: PhotoCreateBatchDtoFixture,
  ) {
    return this.crudResolver.createBatch(ctx, photoCreateBatchDto);
  }

  @CrudCreate({ command: CrudCreateCommand })
  async create(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateDto: PhotoCreateDtoFixture,
  ) {
    return this.crudResolver.create(ctx, photoCreateDto);
  }

  @CrudUpdate({ command: CrudUpdateCommand })
  async update(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoUpdateDto: PhotoUpdateDtoFixture,
  ) {
    return this.crudResolver.update(ctx, photoUpdateDto);
  }

  @CrudReplace({ command: CrudReplaceCommand })
  async replace(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateDto: PhotoCreateDtoFixture,
  ) {
    return this.crudResolver.replace(ctx, photoCreateDto);
  }

  @CrudDelete({ command: CrudDeleteCommand })
  async delete(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.delete(ctx);
  }

  @CrudSoftDelete({ path: 'soft/:id', command: CrudSoftDeleteCommand })
  async softDelete(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.softDelete(ctx);
  }

  @CrudRestore({ command: CrudRestoreCommand })
  async restore(
    @Ctx(CrudCtx)
    ctx: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.restore(ctx);
  }
}
