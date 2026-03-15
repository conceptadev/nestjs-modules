import { CommandBus } from '@nestjs/cqrs';

export function createMockCommandBus(): jest.Mocked<CommandBus> {
  return {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CommandBus>;
}
