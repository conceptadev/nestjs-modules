import {
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  RoleAssignmentEntityInterface,
  Where,
} from '@concepta/nestjs-common';

import { RoleAssignment } from '../../domain/aggregates/role-assignment';

export class RoleAssignmentRepository {
  constructor(
    protected readonly repository: RepositoryInterface<RoleAssignmentEntityInterface>,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<RoleAssignment | null> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? RoleAssignment.toInstance(entity) : null;
  }

  async findByAssignee(
    ctx: RepositoryContextInterface,
    assigneeId: string,
  ): Promise<RoleAssignment[]> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    const entities = await this.repository.find({
      where: w.eq('assigneeId', assigneeId),
      ctx,
    });

    return entities.map((e) => RoleAssignment.toInstance(e));
  }

  async findOne(
    ctx: RepositoryContextInterface,
    roleId: string,
    assigneeId: string,
  ): Promise<RoleAssignment | null> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(w.eq('roleId', roleId), w.eq('assigneeId', assigneeId)),
      ctx,
    });

    return entity ? RoleAssignment.toInstance(entity) : null;
  }

  async findByRoleIdsAndAssignee(
    ctx: RepositoryContextInterface,
    roleIds: string[],
    assigneeId: string,
  ): Promise<RoleAssignment[]> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    const entities = await this.repository.find({
      where: w.and(w.in('roleId', roleIds), w.eq('assigneeId', assigneeId)),
      ctx,
    });

    return entities.map((e) => RoleAssignment.toInstance(e));
  }

  async countByRoleIdAndAssignee(
    ctx: RepositoryContextInterface,
    roleId: string,
    assigneeId: string,
  ): Promise<number> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    return this.repository.count({
      where: w.and(w.eq('roleId', roleId), w.eq('assigneeId', assigneeId)),
      ctx,
    });
  }

  async countByRoleIdsAndAssignee(
    ctx: RepositoryContextInterface,
    roleIds: string[],
    assigneeId: string,
  ): Promise<number> {
    const w = Where.for<RoleAssignmentEntityInterface>();

    return this.repository.count({
      where: w.and(w.in('roleId', roleIds), w.eq('assigneeId', assigneeId)),
      ctx,
    });
  }

  async save(
    ctx: RepositoryContextInterface,
    roleAssignment: RoleAssignment,
  ): Promise<void> {
    const entity = await this.repository.upsert(roleAssignment.toPlain(), {
      ctx,
    });
    roleAssignment.hydrate(entity);
  }

  /**
   * Save multiple assignments sequentially within the current transaction.
   * Sequential execution ensures consistent ordering and avoids
   * potential issues with parallel writes in the same transaction.
   */
  async saveMany(
    ctx: RepositoryContextInterface,
    roleAssignments: RoleAssignment[],
  ): Promise<void> {
    for (const ra of roleAssignments) {
      await this.save(ctx, ra);
    }
  }

  async remove(
    ctx: RepositoryContextInterface,
    roleAssignment: RoleAssignment,
  ): Promise<void> {
    await this.repository.delete(roleAssignment.toPlain(), { ctx });
  }

  async removeMany(
    ctx: RepositoryContextInterface,
    roleAssignments: RoleAssignment[],
  ): Promise<void> {
    await this.repository.deleteMany(
      roleAssignments.map((ra) => ra.toPlain()),
      { ctx },
    );
  }
}
