import { Entity } from 'typeorm';

import { InvitationSqliteEntity } from '../../../../../infrastructure/persistence/typeorm/invitation-sqlite.entity';

@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {}
