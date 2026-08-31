import { ApiBody, type ApiBodyOptions } from '@nestjs/swagger';

import { type DecoratorTargetObject } from '../../../crud.types.js';
import { CrudException } from '../../exceptions/crud.exception.js';

/**
 * \@CrudApiBody() open api decorator
 */
export function CrudApiBody(options?: ApiBodyOptions): MethodDecorator {
  return (classTarget: DecoratorTargetObject, ...rest) => {
    const [propertyKey] = rest;

    if ('__proto__' in classTarget) {
      // need the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(
        classTarget,
        propertyKey,
      );

      // sanity check
      if (!descriptor) {
        throw new CrudException({
          message: 'Did not find property descriptor',
          fault: 'usage',
        });
      }

      ApiBody(options ?? {})(classTarget.prototype, propertyKey, descriptor);
    } else {
      throw new CrudException({
        message: 'Cannot decorate with api body, target must be a class',
        fault: 'usage',
      });
    }
  };
}
