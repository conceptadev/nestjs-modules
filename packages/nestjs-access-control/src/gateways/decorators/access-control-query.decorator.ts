import { SetMetadata } from '@nestjs/common';

import { ACCESS_CONTROL_MODULE_QUERY_METADATA } from '../../access-control.constants';
import { type AccessControlQueryOptionInterface } from '../../domain/interfaces/access-control-query-option.interface';

/**
 * Define access query options for this route.
 *
 * @param queryOptions - Array of access control query options.
 * @returns Decorator function.
 */
export const AccessControlQuery = (
  ...queryOptions: AccessControlQueryOptionInterface[]
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_MODULE_QUERY_METADATA, queryOptions);
};
