import { Column } from 'typeorm';

import {
  ReferenceId,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

export abstract class UserCredentialSqliteEntity
  extends CommonSqliteEntity
  implements UserCredentialEntityInterface
{
  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'text' })
  passwordSalt!: string;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'datetime' })
  validFrom!: Date;

  @Column({ type: 'datetime', nullable: true })
  validTo!: Date | null;
}
