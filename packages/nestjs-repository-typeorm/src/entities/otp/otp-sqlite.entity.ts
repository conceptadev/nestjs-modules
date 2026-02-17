import { Column } from 'typeorm';

import { ReferenceId, OtpInterface } from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * Otp Sqlite Entity
 */
export abstract class OtpSqliteEntity
  extends CommonSqliteEntity
  implements OtpInterface
{
  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'datetime' })
  expirationDate!: Date;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
