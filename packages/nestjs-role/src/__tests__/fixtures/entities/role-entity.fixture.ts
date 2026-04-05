import { Entity } from 'typeorm';

import { RoleSqliteEntity } from '../../../infrastructure/persistence/typeorm/role-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture extends RoleSqliteEntity {}
