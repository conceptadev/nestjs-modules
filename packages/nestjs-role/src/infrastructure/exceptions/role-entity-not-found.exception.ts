import {
  type RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

import { RoleException } from '../../application/exceptions/role.exception';

export class RoleEntityNotFoundException extends RoleException {
  declare context: RuntimeException['context'] & { entityName: string };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Entity %s was not registered to be used.',
      messageParams: [entityName],
      ...options,
    });

    this.errorCode = 'ROLE_ENTITY_NOT_FOUND_ERROR';

    this.context = {
      ...this.context,
      entityName,
    };
  }
}
