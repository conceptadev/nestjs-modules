import { CacheContextInterface } from './cache-context.interface';

export interface WithCacheContextInterface {
  withCache(): CacheContextInterface;
}
