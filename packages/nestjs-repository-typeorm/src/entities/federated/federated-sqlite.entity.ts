import { Column, Entity } from 'typeorm';

import {
  ReferenceIdInterface,
  FederatedEntityInterface,
} from '@concepta/nestjs-common';

import { CommonSqliteEntity } from '../common/common-sqlite.entity';

/**
 * Federated Sqlite Entity
 */
@Entity()
export class FederatedSqliteEntity
  extends CommonSqliteEntity
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
