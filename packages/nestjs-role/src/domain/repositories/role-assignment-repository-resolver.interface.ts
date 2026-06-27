import { type RoleAssignmentRepositoryInterface } from './role-assignment-repository.interface';

export interface RoleAssignmentRepositoryResolverInterface {
  resolve(entityKey: string): RoleAssignmentRepositoryInterface;
}
