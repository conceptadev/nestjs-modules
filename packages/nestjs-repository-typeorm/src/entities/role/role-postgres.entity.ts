import { Column } from 'typeorm';

import { RoleEntityInterface } from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

/**
 * Role Postgres Entity
 */
export abstract class RolePostgresEntity
  extends CommonPostgresEntity
  implements RoleEntityInterface
{
  /**
   * Name
   */
  @Column()
  name!: string;

  /**
   * Description
   */
  @Column()
  description!: string;
}
