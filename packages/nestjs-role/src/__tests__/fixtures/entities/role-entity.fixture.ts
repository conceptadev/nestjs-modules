import { Entity } from 'typeorm';

import { RoleSqliteEntity } from '@concepta/nestjs-repository-typeorm';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture extends RoleSqliteEntity {}
