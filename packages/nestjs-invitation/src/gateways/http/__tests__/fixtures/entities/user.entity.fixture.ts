import { Entity } from 'typeorm';

import { UserSqliteEntity } from '@concepta/nestjs-repository-typeorm';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
