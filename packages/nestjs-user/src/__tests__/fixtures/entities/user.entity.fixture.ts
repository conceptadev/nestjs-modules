import { Entity } from 'typeorm';

import { UserSqliteEntity } from '../../../infrastructure/persistence/typeorm/user-sqlite.entity';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
