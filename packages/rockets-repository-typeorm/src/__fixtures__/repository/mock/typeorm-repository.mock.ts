import { Repository } from 'typeorm';

import { TypeOrmRepository } from '../../../repository/typeorm-repository';

interface TestEntity {
  id: string;
}

class TestEntityClass {
  id!: string;
}

export function mockTypeOrmRepository(): TypeOrmRepository<TestEntity> {
  const repo = {
    metadata: {
      name: 'TestEntity',
      targetName: 'TestEntity',
      columns: [{ propertyName: 'id', isPrimary: true, isDeleteDate: false }],
      relations: [],
    },
    target: TestEntityClass,
  } as unknown as Repository<TestEntity>;

  return new TypeOrmRepository(repo, { entityKey: 'test-entity' });
}
