import { Column, Unique } from 'typeorm';

import {
  ReferenceId,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

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
