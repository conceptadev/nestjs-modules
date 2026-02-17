import { Column } from 'typeorm';

import { UserEntityInterface } from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

/**
 * User Entity
 */
export abstract class UserPostgresEntity
  extends CommonPostgresEntity
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
}
