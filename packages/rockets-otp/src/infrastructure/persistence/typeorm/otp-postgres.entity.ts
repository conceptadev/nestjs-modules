import { Column } from 'typeorm';

import { ReferenceId } from '@concepta/rockets-app';
import { CommonPostgresEntity } from '@concepta/rockets-repository-typeorm';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

/**
 * Otp Postgres Entity
 */
export abstract class OtpPostgresEntity
  extends CommonPostgresEntity
  implements OtpInterface
{
  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'timestamptz' })
  expirationDate!: Date;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'uuid' })
  assigneeId!: ReferenceId;
}
