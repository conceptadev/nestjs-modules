import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/rockets-app';

/**
 * Api Key Entity Fixture
 */
@Entity()
export class ApiKeyEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
