import { applyDecorators } from '@nestjs/common';

import { ActionEnum } from '@concepta/nestjs-common';

import { AccessControlGrant } from './access-control-grant.decorator';

/**
 * Update one resource grant shortcut.
 *
 * @param resource - The grant resource.
 * @returns Decorator function
 */
export const AccessControlUpdateOne = (
  resource: string,
): ReturnType<typeof applyDecorators> =>
  AccessControlGrant({
    resource: resource,
    action: ActionEnum.UPDATE,
  });
