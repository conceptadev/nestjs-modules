import { CacheInvalidExpiredDateException } from '../cache-invalid-expired-date.exception';
import { CacheException } from '../cache.exception';

describe(CacheInvalidExpiredDateException.name, () => {
  it('should be an instance of CacheException', () => {
    const exception = new CacheInvalidExpiredDateException();
    expect(exception).toBeInstanceOf(CacheException);
  });

  it('should have message "Invalid expiresIn"', () => {
    const exception = new CacheInvalidExpiredDateException();
    expect(exception.message).toBe('Invalid expiresIn');
  });

  it('should have errorCode CACHE_INVALID_EXPIRES_IN', () => {
    const exception = new CacheInvalidExpiredDateException();
    expect(exception.errorCode).toBe('CACHE_INVALID_EXPIRES_IN');
  });
});
