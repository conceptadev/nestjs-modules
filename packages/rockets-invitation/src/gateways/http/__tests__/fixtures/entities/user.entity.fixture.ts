import { Entity } from 'typeorm';

import { UserSqliteEntity } from '@concepta/rockets-user/optional/typeorm';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
