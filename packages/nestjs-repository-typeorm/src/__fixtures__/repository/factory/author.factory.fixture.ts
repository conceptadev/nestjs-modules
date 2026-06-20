import { faker } from '@faker-js/faker';

import { Factory } from '@concepta/typeorm-seeding';

import { AuthorEntityFixture } from '../entity/author.entity.fixture';

export class AuthorFactoryFixture extends Factory<AuthorEntityFixture> {
  protected async entity(
    author: AuthorEntityFixture,
  ): Promise<AuthorEntityFixture> {
    author.name = faker.person.firstName();
    return author;
  }
}
