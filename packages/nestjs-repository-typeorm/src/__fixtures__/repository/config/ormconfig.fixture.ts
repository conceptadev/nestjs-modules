import { DataSourceOptions } from 'typeorm';

import { TestEntityFixture } from '../entity/test.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [TestEntityFixture],
};
