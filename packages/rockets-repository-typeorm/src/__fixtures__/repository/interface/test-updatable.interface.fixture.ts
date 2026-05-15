import { TestInterfaceFixture } from './test-entity.interface.fixture';

export interface TestUpdatableInterfaceFixture
  extends Pick<TestInterfaceFixture, 'id'>,
    Partial<Pick<TestInterfaceFixture, 'firstName' | 'lastName'>> {}
