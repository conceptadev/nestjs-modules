import { Column } from 'typeorm';

import { UserProfileEntityInterface } from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

/**
 * User Profile Postgres Entity
 */
export abstract class UserProfilePostgresEntity
  extends CommonPostgresEntity
  implements UserProfileEntityInterface
{
  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: string;
}
