import { DataSourceOptions } from 'typeorm';

import { AuthorEntityFixture } from '../entity/author.entity.fixture';
import { PostEntityFixture } from '../entity/post.entity.fixture';
import { TagEntityFixture } from '../entity/tag.entity.fixture';

export const relationOrmConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [AuthorEntityFixture, PostEntityFixture, TagEntityFixture],
};
