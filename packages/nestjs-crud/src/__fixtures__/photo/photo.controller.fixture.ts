import { Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
import { CrudResolverInterface } from '../../crud/interfaces/crud-resolver.interface';
import { CrudCreateBatchCommand } from '../../crud/operations/commands/crud-create-batch.command';
import { CrudCreateCommand } from '../../crud/operations/commands/crud-create.command';
import { CrudDeleteCommand } from '../../crud/operations/commands/crud-delete.command';
import { CrudReplaceCommand } from '../../crud/operations/commands/crud-replace.command';
import { CrudRestoreCommand } from '../../crud/operations/commands/crud-restore.command';
import { CrudSoftDeleteCommand } from '../../crud/operations/commands/crud-soft-delete.command';
import { CrudUpdateCommand } from '../../crud/operations/commands/crud-update.command';
import { CrudListQuery } from '../../crud/operations/queries/crud-list.query';
import { CrudReadQuery } from '../../crud/operations/queries/crud-read.query';
import { CrudAdapterResolver } from '../../crud/resolvers/crud-adapter.resolver';

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
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.list(crudContext);
  }

  @CrudRead({ query: CrudReadQuery })
  async read(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.read(crudContext);
  }

  @CrudCreateBatch({ command: CrudCreateBatchCommand })
  async createBatch(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateBatchDto: PhotoCreateBatchDtoFixture,
  ) {
    return this.crudResolver.createBatch(crudContext, photoCreateBatchDto);
  }

  @CrudCreate({ command: CrudCreateCommand })
  async create(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateDto: PhotoCreateDtoFixture,
  ) {
    return this.crudResolver.create(crudContext, photoCreateDto);
  }

  @CrudUpdate({ command: CrudUpdateCommand })
  async update(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoUpdateDto: PhotoUpdateDtoFixture,
  ) {
    return this.crudResolver.update(crudContext, photoUpdateDto);
  }

  @CrudReplace({ command: CrudReplaceCommand })
  async replace(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
    @CrudBody() photoCreateDto: PhotoCreateDtoFixture,
  ) {
    return this.crudResolver.replace(crudContext, photoCreateDto);
  }

  @CrudDelete({ command: CrudDeleteCommand })
  async delete(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.delete(crudContext);
  }

  @CrudSoftDelete({ path: 'soft/:id', command: CrudSoftDeleteCommand })
  async softDelete(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.softDelete(crudContext);
  }

  @CrudRestore({ command: CrudRestoreCommand })
  async restore(
    @Ctx()
    crudContext: CrudContextInterface<PhotoEntityInterfaceFixture>,
  ) {
    return this.crudResolver.restore(crudContext);
  }
}
