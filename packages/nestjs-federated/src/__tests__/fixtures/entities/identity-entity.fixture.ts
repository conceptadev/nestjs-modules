import { Entity, ManyToOne } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/rockets-app';

import { IdentitySqliteEntity } from '../../../infrastructure/persistence/typeorm/identity-sqlite.entity';

@Entity()
export class IdentityEntityFixture extends IdentitySqliteEntity {
  @ManyToOne('UserEntityFixture', { eager: true })
  user!: ReferenceIdInterface;
}
