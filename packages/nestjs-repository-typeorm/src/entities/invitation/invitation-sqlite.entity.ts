import { Column } from 'typeorm';

import { PlainLiteralObject } from '@nestjs/common';

import {
  ReferenceActive,
  ReferenceId,
  InvitationEntityInterface,
} from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

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
}
