import { Column } from 'typeorm';

import { CommonSqliteEntity } from '@concepta/nestjs-repository-typeorm';
import { ReferenceId } from '@concepta/rockets-app';

import { UserCredentialEntityInterface } from '../../../domain/interfaces/user-credential-entity.interface';

export abstract class UserCredentialSqliteEntity
  extends CommonSqliteEntity
  implements UserCredentialEntityInterface
{
  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'datetime' })
  validFrom!: Date;

  @Column({ type: 'datetime', nullable: true })
  validTo!: Date | null;
}
