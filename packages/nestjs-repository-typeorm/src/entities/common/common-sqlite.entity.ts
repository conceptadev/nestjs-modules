import { PrimaryGeneratedColumn } from 'typeorm';

import { AuditInterface, ReferenceIdInterface } from '@concepta/rockets-app';

import { AuditSqlLiteEntity } from '../audit/audit-sqlite.entity';

export abstract class CommonSqliteEntity
  extends AuditSqlLiteEntity
  implements ReferenceIdInterface, AuditInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
