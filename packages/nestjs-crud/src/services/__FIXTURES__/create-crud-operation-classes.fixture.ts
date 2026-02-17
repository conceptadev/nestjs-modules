import { PlainLiteralObject } from '@nestjs/common';

import { CrudCreateBatchCommand } from '../../crud/operations/commands/crud-create-batch.command';
import { CrudCreateCommand } from '../../crud/operations/commands/crud-create.command';
import { CrudDeleteCommand } from '../../crud/operations/commands/crud-delete.command';
import { CrudReplaceCommand } from '../../crud/operations/commands/crud-replace.command';
import { CrudRestoreCommand } from '../../crud/operations/commands/crud-restore.command';
import { CrudSoftDeleteCommand } from '../../crud/operations/commands/crud-soft-delete.command';
import { CrudUpdateCommand } from '../../crud/operations/commands/crud-update.command';
import { CrudListQuery } from '../../crud/operations/queries/crud-list.query';
import { CrudReadQuery } from '../../crud/operations/queries/crud-read.query';
import {
  createCommand,
  createQuery,
} from '../../crud/operations/util/create-operation-classes';

/**
 * Creates unique query and command classes for an entity.
 * Each call creates new class definitions with prefixed names.
 *
 * @param name - Prefix for class names (e.g., 'User' creates UserCrudListQuery)
 */
export function createCrudOperationClasses<Entity extends PlainLiteralObject>(
  name: string,
) {
  return {
    CrudListQuery: createQuery<Entity>(name, CrudListQuery<Entity>),
    CrudReadQuery: createQuery<Entity>(name, CrudReadQuery<Entity>),
    CrudCreateCommand: createCommand<Entity>(name, CrudCreateCommand<Entity>),
    CrudCreateBatchCommand: createCommand<Entity>(
      name,
      CrudCreateBatchCommand<Entity>,
    ),
    CrudUpdateCommand: createCommand<Entity>(name, CrudUpdateCommand<Entity>),
    CrudReplaceCommand: createCommand<Entity>(name, CrudReplaceCommand<Entity>),
    CrudDeleteCommand: createCommand<Entity>(name, CrudDeleteCommand<Entity>),
    CrudSoftDeleteCommand: createCommand<Entity>(
      name,
      CrudSoftDeleteCommand<Entity>,
    ),
    CrudRestoreCommand: createCommand<Entity>(name, CrudRestoreCommand<Entity>),
  };
}
