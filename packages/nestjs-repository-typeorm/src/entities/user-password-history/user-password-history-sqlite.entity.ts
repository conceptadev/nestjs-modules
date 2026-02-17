import { Column } from 'typeorm';

import {
  ReferenceId,
  UserPasswordHistoryEntityInterface,
} from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * User Entity
 */
export abstract class UserPasswordHistorySqliteEntity
  extends CommonSqliteEntity
  implements UserPasswordHistoryEntityInterface
{
  /**
   * Password hash
   */
  @Column({ type: 'text', nullable: true })
  passwordHash!: string;

  /**
   * Password salt
   */
  @Column({ type: 'text', nullable: true })
  passwordSalt!: string;

  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: ReferenceId;
}
