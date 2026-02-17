import { CRUD_MODULE_RESOLVER_METADATA } from '../../../crud.constants';
import {
  CrudMetadata,
  CrudMetadataLookupTarget,
} from '../../../services/crud-metadata.service';

/**
 * Set the resolver for a controller or method.
 *
 * When applied to a class, sets the default resolver for all methods.
 * When applied to a method, overrides the controller/module default.
 *
 * Resolution order: `method > controller > module default`
 *
 * @example
 * ```typescript
 * // Controller-level: all methods use this resolver
 * @Controller('products')
 * @CrudResolver(CrudOperationResolver)
 * class ProductController {
 *   // ...
 * }
 *
 * // Method-level: override for specific method
 * @CrudList()
 * @CrudResolver(CrudCqrsResolver)
 * async list(@Ctx() ctx) {
 *   return this.crudResolver.list(ctx);
 * }
 * ```
 */
export const CrudResolver = CrudMetadata.createDecorator({
  key: CRUD_MODULE_RESOLVER_METADATA,
  lookupTarget: CrudMetadataLookupTarget.MethodAndClass,
});
