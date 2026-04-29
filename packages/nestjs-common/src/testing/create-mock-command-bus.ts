import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { CommandBus } from '@nestjs/cqrs';

/**
 * Create a mock CommandBus for unit testing.
 */
export function createMockCommandBus(): DeepMockProxy<CommandBus> {
  return mockDeep<CommandBus>();
}
