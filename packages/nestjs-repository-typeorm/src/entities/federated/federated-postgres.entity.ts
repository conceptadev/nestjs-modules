import { Column, Entity } from 'typeorm';

import {
  ReferenceIdInterface,
  FederatedEntityInterface,
} from '@concepta/nestjs-common';

import { CommonPostgresEntity } from '../common/common-postgres.entity';

/**
 * Federated Postgres Entity
 */
@Entity()
export class FederatedPostgresEntity
  extends CommonPostgresEntity
  implements FederatedEntityInterface
{
  /**
   * provider
   */
  @Column()
  provider!: string;

  /**
   * subject
   */
  @Column()
  subject!: string;

  /**
   * User
   */
  user!: ReferenceIdInterface;
}
