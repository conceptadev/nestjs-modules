import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { PhotoFixture } from './photo/photo.entity.fixture';

const config: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [PhotoFixture],
};

export default config;
