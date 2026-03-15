import { DataSourceOptions } from 'typeorm';

import { UserCredentialEntityFixture } from './entities/user-credential.entity.fixture';
import { UserEntityFixture } from './entities/user.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture, UserCredentialEntityFixture],
};
