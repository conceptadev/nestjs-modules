import { CRUD_MODULE_ROUTE_LOCALS_METADATA } from '../../../crud.constants';
import {
  CrudMetadataLookupTarget,
  CrudMetadata,
} from '../../../services/crud-metadata.service';
import { CrudLocal } from '../../interfaces/crud-local.interface';

/**
 * CRUD locals route decorator.
 *
 * Configure CrudLocal resolvers for a controller or method.
 * Resolvers execute sequentially in the order specified.
 * Each resolver can access results from prior resolvers via crudContext.locals.
 *
 * When applied at both class and method level, the resolvers are accumulated
 * (class-level resolvers run first, then method-level resolvers).
 *
 * @example
 * ```typescript
 * @UseCrudLocals(CurrentUserLocal, UserPermissionsLocal)
 * class PostController { ... }
 * ```
 */
export const UseCrudLocals = CrudMetadata.createWrappedDecorator(
  {
    key: CRUD_MODULE_ROUTE_LOCALS_METADATA,
    lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
  },
  (decorator) =>
    (...resolvers: CrudLocal[]) =>
      decorator(resolvers),
);
