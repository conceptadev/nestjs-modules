import { CacheException } from './cache.exception';

export class CacheInvalidExpiredDateException extends CacheException {
  constructor() {
    super({
      message: 'Invalid expiresIn',
    });
    this.errorCode = 'CACHE_INVALID_EXPIRES_IN';
  }
}
