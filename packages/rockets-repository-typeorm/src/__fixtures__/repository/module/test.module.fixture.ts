import { Module } from '@nestjs/common';

import { RepositoryModule } from '@concepta/rockets-repository';

import { TypeOrmRepositoryModule } from '../../../typeorm-repository.module';
import { TEST_ENTITY_TOKEN } from '../config/test.constants.fixture';
import { TestEntityFixture } from '../entity/test.entity.fixture';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [{ key: TEST_ENTITY_TOKEN, entity: TestEntityFixture }],
    }),
  ],
})
export class TestModuleFixture {}
