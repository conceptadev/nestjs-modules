import { Column, Unique } from 'typeorm';

import { CommonSqliteEntity } from '@concepta/nestjs-repository-typeorm';
import { ReferenceId } from '@concepta/rockets-app';

import { RoleAssignmentEntityInterface } from '../../../domain/interfaces/role-assignment-entity.interface';

/**
 * Role Assignment Sqlite Entity
 */
@Unique(['roleId', 'assigneeId'])
export abstract class RoleAssignmentSqliteEntity
  extends CommonSqliteEntity
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
