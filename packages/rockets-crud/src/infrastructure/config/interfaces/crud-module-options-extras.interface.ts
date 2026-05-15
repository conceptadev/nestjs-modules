import { DynamicModule, Type } from '@nestjs/common';

import { CrudResolverInterface } from '../../resolvers/interfaces/crud-resolver.interface';

export interface CrudModuleOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'imports'> {
  /**
   * Default resolver class for CRUD operations.
   * Controllers without an explicit resolver will use this resolver.
   * Defaults to CrudAdapterResolver.
   */
  defaultResolver?: Type<CrudResolverInterface>;
}
