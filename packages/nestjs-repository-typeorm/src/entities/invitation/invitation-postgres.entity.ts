import { Column } from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import {
  ReferenceActive,
  ReferenceId,
  InvitationEntityInterface,
} from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

// TODO check this entity later
export abstract class InvitationPostgresEntity
  extends CommonPostgresEntity
  implements InvitationEntityInterface
{
  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'jsonb' })
  constraints!: PlainLiteralObject;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;
}
