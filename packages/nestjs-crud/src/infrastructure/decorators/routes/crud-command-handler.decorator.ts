import { PlainLiteralObject, Type } from '@nestjs/common';

import { CrudCommandHandlerInterface } from '../../../application/commands/interfaces/crud-command-handler.interface';
import { CRUD_MODULE_ROUTE_COMMAND_HANDLER_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../services/crud-metadata.service';

/**
 * Options for CrudCommandHandler decorator.
 */
export interface CrudCommandHandlerOptionsInterface<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> {
  /** Custom handler class to use directly */
  handler?: Type<CrudCommandHandlerInterface<Entity>>;
  /** Base handler class for generating default command handler class */
  handlerTemplate?: Type<CrudCommandHandlerInterface<Entity>>;
  /** Resolved   handler class (set by CrudInitCommand) */
  resolved?: Type<CrudCommandHandlerInterface<Entity>>;
}

/**
 * CRUD Command Handler route decorator.
 *
 * Stores command handler options as metadata. The actual handler class is resolved
 * later by CrudInitCommandHandler, which applies defaults and generates classes.
 */
export const CrudCommandHandler = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_ROUTE_COMMAND_HANDLER_METADATA,
    lookupTarget: CrudMetadataLookupTarget.Method,
  },
  (decorator) =>
    <Entity extends PlainLiteralObject = PlainLiteralObject>(
      options: CrudCommandHandlerOptionsInterface<Entity> = {},
    ) =>
      decorator(options),
);
