import { Column } from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceActive, ReferenceId } from '@concepta/rockets-app';
import { CommonSqliteEntity } from '@concepta/rockets-repository-typeorm';

import { InvitationEntityInterface } from '../interfaces/invitation-entity.interface';

export abstract class InvitationSqliteEntity
  extends CommonSqliteEntity
  implements InvitationEntityInterface
{
  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'simple-json', nullable: true })
  constraints!: PlainLiteralObject;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  @Column({ type: 'datetime', nullable: true, default: null })
  dateAccepted!: Date | null;

  @Column({ type: 'datetime', nullable: true, default: null })
  dateRevoked!: Date | null;
}
