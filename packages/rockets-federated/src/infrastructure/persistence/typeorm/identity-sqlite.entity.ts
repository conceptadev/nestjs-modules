import { Column } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/rockets-app';
import { CommonSqliteEntity } from '@concepta/rockets-repository-typeorm';

import { IdentityEntityInterface } from '../interfaces/identity-entity.interface';

export abstract class IdentitySqliteEntity
  extends CommonSqliteEntity
  implements IdentityEntityInterface
{
  @Column()
  provider!: string;

  @Column()
  subject!: string;

  abstract user: ReferenceIdInterface;
}
