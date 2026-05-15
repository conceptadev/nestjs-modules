import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';

import { TypeOrmRepositoryModule } from '../../../typeorm-repository.module';
import {
  AUTHOR_ENTITY_TOKEN,
  POST_ENTITY_TOKEN,
  TAG_ENTITY_TOKEN,
} from '../config/relation.constants.fixture';
import { AuthorEntityFixture } from '../entity/author.entity.fixture';
import { PostEntityFixture } from '../entity/post.entity.fixture';
import { TagEntityFixture } from '../entity/tag.entity.fixture';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: AUTHOR_ENTITY_TOKEN, entity: AuthorEntityFixture },
        { key: POST_ENTITY_TOKEN, entity: PostEntityFixture },
        { key: TAG_ENTITY_TOKEN, entity: TagEntityFixture },
      ],
    }),
  ],
})
export class RelationTestModuleFixture {}
