import { Column } from 'typeorm';

import {
  ReferenceId,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

export abstract class UserCredentialPostgresEntity
  extends CommonPostgresEntity
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

  @Column({ type: 'timestamptz' })
  validFrom!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  validTo!: Date | null;
}
