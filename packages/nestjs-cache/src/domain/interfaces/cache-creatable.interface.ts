import { type CacheInterface } from './cache.interface.js';

export interface CacheCreatableInterface extends Pick<
  CacheInterface,
  'key' | 'type' | 'data' | 'assigneeId'
> {
  expiresIn: string | null;
}
