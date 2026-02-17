import { Column } from 'typeorm';

import { UserProfileEntityInterface } from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * User Profile Sqlite Entity
 */
export abstract class UserProfileSqliteEntity
  extends CommonSqliteEntity
  implements UserProfileEntityInterface
{
  @Column({ type: 'uuid' })
  userId!: string;
}
