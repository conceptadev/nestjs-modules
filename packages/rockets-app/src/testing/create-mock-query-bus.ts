import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { QueryBus } from '@nestjs/cqrs';

/**
 * Create a mock QueryBus for unit testing.
 */
export function createMockQueryBus(): DeepMockProxy<QueryBus> {
  return mockDeep<QueryBus>();
}
