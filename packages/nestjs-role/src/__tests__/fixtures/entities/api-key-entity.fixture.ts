import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ReferenceIdInterface } from '@concepta/nestjs-common';

/**
 * Api Key Entity Fixture
 */
@Entity()
export class ApiKeyEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
