import { PlainLiteralObject, Type } from '@nestjs/common';

import { CrudCommandInterface } from '../../../application/commands/interfaces/crud-command.interface';
import { CrudQueryInterface } from '../../../application/queries/interfaces/crud-query.interface';

/**
 * Resolved handler options containing the handler class.
 */
interface CrudResolvedHandlerOptions {
  resolved?: Type;
}

/**
 * Runtime route options available in CrudContext.
 * Contains query/command types, handlers, and return behavior flags.
 */
export interface CrudRouteOptionsInterface<T extends PlainLiteralObject> {
  /** Resolved query class */
  query?: Type<CrudQueryInterface<T>>;
  /** Resolved query handler options */
  queryHandler?: CrudResolvedHandlerOptions;
  /** Resolved command class */
  command?: Type<CrudCommandInterface<T>>;
  /** Resolved command handler options */
  commandHandler?: CrudResolvedHandlerOptions;
  /** Return deleted entity on delete or soft delete operation */
  returnDeleted?: boolean;
  /** Return restored entity on restore operation */
  returnRestored?: boolean;
}
