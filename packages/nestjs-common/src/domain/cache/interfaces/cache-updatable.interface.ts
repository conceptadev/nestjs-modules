import { CacheInterface } from './cache.interface';

export interface CacheUpdatableInterface extends Pick<CacheInterface, 'data'> {
  expiresIn: string | null;
}
