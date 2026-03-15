import { RoleRepositoryInterface } from './role-repository.interface';

export interface RoleRepositoryResolverInterface {
  resolve(entityKey: string): RoleRepositoryInterface;
}
