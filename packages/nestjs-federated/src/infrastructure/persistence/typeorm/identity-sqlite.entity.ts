import { Column } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-repository-typeorm';

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
