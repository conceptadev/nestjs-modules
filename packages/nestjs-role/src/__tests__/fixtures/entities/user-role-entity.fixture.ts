import { Entity } from 'typeorm';

import { RoleAssignmentSqliteEntity } from '../../../infrastructure/persistence/typeorm/role-assignment-sqlite.entity';

/**
 * User Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {}
