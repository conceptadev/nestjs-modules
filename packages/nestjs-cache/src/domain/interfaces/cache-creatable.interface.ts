import { CacheInterface } from './cache.interface';

export interface CacheCreatableInterface
  extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assigneeId'> {
  expiresIn: string | null;
}
