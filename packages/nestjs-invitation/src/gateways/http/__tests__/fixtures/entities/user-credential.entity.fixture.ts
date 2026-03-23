import { Entity } from 'typeorm';

import { UserCredentialSqliteEntity } from '@concepta/nestjs-repository-typeorm';

@Entity()
export class UserCredentialEntityFixture extends UserCredentialSqliteEntity {}
