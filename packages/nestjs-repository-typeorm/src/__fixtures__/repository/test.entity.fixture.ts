import { Column, Entity } from 'typeorm';

import { CommonSqliteEntity } from '../../entities/common/common-sqlite.entity';

import { TestInterfaceFixture } from './interface/test-entity.interface.fixture';

@Entity()
export class TestEntityFixture
  extends CommonSqliteEntity
  implements TestInterfaceFixture
{
  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;
}
