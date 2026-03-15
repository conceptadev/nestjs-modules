import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { RoleAssignment } from '../aggregates/role-assignment';

export interface RoleAssignmentRepositoryInterface {
  get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<RoleAssignment | null>;

  findByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<RoleAssignment[]>;

  findOne(
    ctx: RepositoryContextInterface,
    roleId: string,
    assigneeId: string,
  ): Promise<RoleAssignment | null>;

  findByRoleIdsAndAssignee(
    ctx: RepositoryContextInterface,
    roleIds: string[],
    assigneeId: string,
  ): Promise<RoleAssignment[]>;

  countByRoleIdAndAssignee(
    ctx: RepositoryContextInterface,
    roleId: string,
    assigneeId: string,
  ): Promise<number>;

  countByRoleIdsAndAssignee(
    ctx: RepositoryContextInterface,
    roleIds: string[],
    assigneeId: string,
  ): Promise<number>;

  save(
    ctx: RepositoryContextInterface,
    roleAssignment: RoleAssignment,
  ): Promise<void>;

  saveMany(
    ctx: RepositoryContextInterface,
    roleAssignments: RoleAssignment[],
  ): Promise<void>;

  remove(
    ctx: RepositoryContextInterface,
    roleAssignment: RoleAssignment,
  ): Promise<void>;

  removeMany(
    ctx: RepositoryContextInterface,
    roleAssignments: RoleAssignment[],
  ): Promise<void>;
}
