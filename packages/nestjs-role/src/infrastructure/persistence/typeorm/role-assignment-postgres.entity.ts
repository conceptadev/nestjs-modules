import { Column, Unique } from 'typeorm';

import { CommonPostgresEntity } from '@concepta/nestjs-repository-typeorm';
import { ReferenceId } from '@concepta/rockets-app';

import { RoleAssignmentEntityInterface } from '../../../domain/interfaces/role-assignment-entity.interface';

/**
 * Role Assignment Postgres Entity
 */
@Unique(['roleId', 'assigneeId'])
export abstract class RoleAssignmentPostgresEntity
  extends CommonPostgresEntity
  implements RoleAssignmentEntityInterface
{
  /**
   * Role ID
   */
  @Column({ type: 'uuid' })
  roleId!: ReferenceId;

  /**
   * Assignee ID
   */
  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
