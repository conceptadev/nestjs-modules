import { QueryBus } from '@nestjs/cqrs';

/**
 * Create a mock QueryBus for unit testing.
 */
export function createMockQueryBus(): jest.Mocked<QueryBus> {
  return {
    execute: jest.fn(),
  } as unknown as jest.Mocked<QueryBus>;
}
