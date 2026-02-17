import { faker } from '@faker-js/faker';

import { Factory } from '@concepta/typeorm-seeding';

import { TestEntityFixture } from './test.entity.fixture';

/**
 * Test factory
 */
export class TestFactoryFixture extends Factory<TestEntityFixture> {
  /**
   * Factory callback function.
   */
  protected async entity(user: TestEntityFixture): Promise<TestEntityFixture> {
    user.firstName = faker.name.firstName();
    user.lastName = faker.name.lastName();
    return user;
  }
}
