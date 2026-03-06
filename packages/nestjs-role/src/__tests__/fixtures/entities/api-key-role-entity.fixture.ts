import { Entity } from 'typeorm';

import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-repository-typeorm';

/**
 * Api Key Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleAssignmentSqliteEntity {}
