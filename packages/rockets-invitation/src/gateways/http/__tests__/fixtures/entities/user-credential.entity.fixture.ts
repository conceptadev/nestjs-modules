import { Entity } from 'typeorm';

import { UserCredentialSqliteEntity } from '@concepta/rockets-user/optional/typeorm';

@Entity()
export class UserCredentialEntityFixture extends UserCredentialSqliteEntity {}
