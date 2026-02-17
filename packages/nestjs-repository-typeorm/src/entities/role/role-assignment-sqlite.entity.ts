import { Column, Unique } from 'typeorm';

import {
  ReferenceId,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

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
