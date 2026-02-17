import { Column } from 'typeorm';

import { RoleEntityInterface } from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * Role Sqlite Entity
 */
export abstract class RoleSqliteEntity
  extends CommonSqliteEntity
  implements RoleEntityInterface
{
  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;
}
