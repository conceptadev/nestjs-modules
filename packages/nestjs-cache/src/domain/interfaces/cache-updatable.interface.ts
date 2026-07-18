import { type CacheInterface } from './cache.interface.js';

export interface CacheUpdatableInterface extends Pick<CacheInterface, 'data'> {
  expiresIn: string | null;
}
