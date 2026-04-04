import { Column } from 'typeorm';

import { UserEntityInterface } from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * User Entity
 */
export abstract class UserSqliteEntity
  extends CommonSqliteEntity
  implements UserEntityInterface
{
  /**
   * Email
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Username
   */
  @Column({ unique: true })
  username!: string;

  /**
   * Active
   */
  @Column({ default: true })
  active!: boolean;

}
