import { HttpStatus } from '@nestjs/common';

import { RuntimeException } from '@concepta/nestjs-common';

import { CacheException } from '../../domain/exceptions/cache.exception';

export class CacheNotFoundException extends CacheException {
  context: RuntimeException['context'] & {
    id: string;
  };

  constructor(id: string, message = 'Cache not found for id=%s') {
    super({
      httpStatus: HttpStatus.NOT_FOUND,
      message,
      messageParams: [id],
    });

    this.errorCode = 'CACHE_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      id,
    };
  }
}
