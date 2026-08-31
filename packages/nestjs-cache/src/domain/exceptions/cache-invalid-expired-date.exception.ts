import { HttpStatus } from '@nestjs/common';

import { CacheException } from './cache.exception.js';

export class CacheInvalidExpiredDateException extends CacheException {
  constructor() {
    super({
      message: 'Invalid expiresIn',
      httpStatus: HttpStatus.BAD_REQUEST,
      fault: 'client',
    });
    this.errorCode = 'CACHE_INVALID_EXPIRES_IN';
  }
}
