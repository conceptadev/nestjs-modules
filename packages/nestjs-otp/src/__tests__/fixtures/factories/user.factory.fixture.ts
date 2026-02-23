import { Factory } from '@concepta/typeorm-seeding';

import { UserEntityFixture } from '../entities/user-entity.fixture';

export class UserFactoryFixture extends Factory<UserEntityFixture> {
  options = {
    entity: UserEntityFixture,
  };
}
