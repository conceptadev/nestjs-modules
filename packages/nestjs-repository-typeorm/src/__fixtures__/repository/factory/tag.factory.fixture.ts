import { faker } from '@faker-js/faker';

import { Factory } from '@concepta/typeorm-seeding';

import { TagEntityFixture } from '../entity/tag.entity.fixture';

export class TagFactoryFixture extends Factory<TagEntityFixture> {
  protected async entity(tag: TagEntityFixture): Promise<TagEntityFixture> {
    tag.label = faker.word.noun();
    return tag;
  }
}
