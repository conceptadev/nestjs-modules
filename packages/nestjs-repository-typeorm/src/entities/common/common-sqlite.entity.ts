import { PrimaryGeneratedColumn } from 'typeorm';

import { AuditInterface, ReferenceIdInterface } from '@concepta/nestjs-core';

import { AuditSqlLiteEntity } from '../audit/audit-sqlite.entity.js';

export abstract class CommonSqliteEntity
  extends AuditSqlLiteEntity
  implements ReferenceIdInterface, AuditInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
