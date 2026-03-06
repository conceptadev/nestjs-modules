import { Entity } from 'typeorm';

import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-repository-typeorm';

/**
 * User Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {}
