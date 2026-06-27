import { type TestInterfaceFixture } from './test-entity.interface.fixture';

export interface TestCreatableInterfaceFixture extends Pick<
  TestInterfaceFixture,
  'firstName' | 'lastName'
> {}
