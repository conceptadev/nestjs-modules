import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Ctx } from '@concepta/rockets-app';

import { CrudCreateBatchCommand } from '../../application/commands/impl/crud-create-batch.command';
import { CrudCreateCommand } from '../../application/commands/impl/crud-create.command';
import { CrudDeleteCommand } from '../../application/commands/impl/crud-delete.command';
import { CrudReplaceCommand } from '../../application/commands/impl/crud-replace.command';
import { CrudRestoreCommand } from '../../application/commands/impl/crud-restore.command';
import { CrudSoftDeleteCommand } from '../../application/commands/impl/crud-soft-delete.command';
import { CrudUpdateCommand } from '../../application/commands/impl/crud-update.command';
import { CrudListQuery } from '../../application/queries/impl/crud-list.query';
import { CrudReadQuery } from '../../application/queries/impl/crud-read.query';
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

import { PhotoCreateBatchDtoFixture } from './dto/photo-create-batch.dto.fixture';
import { PhotoCreateDtoFixture } from './dto/photo-create.dto.fixture';
import { PhotoPaginatedDtoFixture } from './dto/photo-paginated.dto.fixture';
import { PhotoUpdateDtoFixture } from './dto/photo-update.dto.fixture';
import { PhotoDtoFixture } from './dto/photo.dto.fixture';
import { PhotoEntityInterfaceFixture } from './interfaces/photo-entity.interface.fixture';

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
