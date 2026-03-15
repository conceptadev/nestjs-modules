import { CacheRepositoryInterface } from './cache-repository.interface';

export interface CacheRepositoryResolverInterface {
  resolve(entityKey: string): CacheRepositoryInterface;
}
