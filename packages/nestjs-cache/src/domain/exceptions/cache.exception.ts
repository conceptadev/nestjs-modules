import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';
/**
 * Generic cache exception.
 */
export class CacheException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'CACHE_ERROR';
  }
}
