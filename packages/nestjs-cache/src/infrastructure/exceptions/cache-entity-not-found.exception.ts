import { type RuntimeException } from '@concepta/nestjs-core';

import { CacheException } from '../../domain/exceptions/cache.exception';

export class CacheEntityNotFoundException extends CacheException {
  declare context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(
    entityName: string,
    message = 'Entity %s was not registered to be used.',
  ) {
    super({
      message,
      messageParams: [entityName],
    });

    this.errorCode = 'CACHE_ENTITY_NOT_FOUND_ERROR';

    this.context = {
      ...this.context,
      entityName,
    };
  }
}
