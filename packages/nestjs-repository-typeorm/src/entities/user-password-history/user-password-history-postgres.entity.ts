import { Column } from 'typeorm';

import {
  ReferenceId,
  UserPasswordHistoryEntityInterface,
} from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

/**
 * User Entity
 */
export abstract class UserPasswordHistoryPostgresEntity
  extends CommonPostgresEntity
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
