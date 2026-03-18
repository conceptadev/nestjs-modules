import { CommandBus } from '@nestjs/cqrs';

/**
 * Create a mock CommandBus for unit testing.
 */
export function createMockCommandBus(): jest.Mocked<CommandBus> {
  return {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CommandBus>;
}
