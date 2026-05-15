import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/rockets-app';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isActive!: boolean;
}
