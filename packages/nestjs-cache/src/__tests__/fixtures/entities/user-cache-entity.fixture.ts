import { Entity, Unique } from 'typeorm';

import { CacheSqliteEntity } from '@concepta/nestjs-repository-typeorm';

/**
 * Cache Entity Fixture
 */
@Entity()
@Unique(['key', 'type', 'assigneeId'])
export class UserCacheEntityFixture extends CacheSqliteEntity {}
