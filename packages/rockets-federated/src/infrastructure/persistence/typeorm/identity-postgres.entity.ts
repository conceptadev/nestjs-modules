import { Column } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/rockets-app';
import { CommonPostgresEntity } from '@concepta/rockets-repository-typeorm';

import { IdentityEntityInterface } from '../interfaces/identity-entity.interface';

export abstract class IdentityPostgresEntity
  extends CommonPostgresEntity
  implements IdentityEntityInterface
{
  @Column()
  provider!: string;

  @Column()
  subject!: string;

  abstract user: ReferenceIdInterface;
}
