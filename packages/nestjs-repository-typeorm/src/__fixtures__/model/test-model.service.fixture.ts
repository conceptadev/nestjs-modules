import { Injectable } from '@nestjs/common';

import {
  ModelService,
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import { TEST_ENTITY_TOKEN } from '../repository/config/test.constants.fixture';
import { TestCreateDtoFixture } from '../repository/dto/test-create.dto.fixture';
import { TestUpdateDtoFixture } from '../repository/dto/test-update.dto.fixture';
import { TestEntityFixture } from '../repository/entity/test.entity.fixture';
import { TestCreatableInterfaceFixture } from '../repository/interface/test-creatable.interface.fixture';
import { TestUpdatableInterfaceFixture } from '../repository/interface/test-updatable.interface.fixture';

@Injectable()
export class TestModelServiceFixture extends ModelService<
  TestEntityFixture,
  TestCreatableInterfaceFixture,
  TestUpdatableInterfaceFixture
> {
  protected createDto = TestCreateDtoFixture;
  protected updateDto = TestUpdateDtoFixture;

  constructor(
    @InjectDynamicRepository(TEST_ENTITY_TOKEN)
    repo: RepositoryInterface<TestEntityFixture>,
  ) {
    super(repo);
  }
}
