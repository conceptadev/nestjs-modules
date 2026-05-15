import { Factory } from '@concepta/typeorm-seeding';

import { UserRoleEntityFixture } from '../entities/user-role-entity.fixture';

export class UserRoleFactoryFixture extends Factory<UserRoleEntityFixture> {
  protected options = {
    entity: UserRoleEntityFixture,
  };
}
