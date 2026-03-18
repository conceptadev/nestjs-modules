import { EventPublisher } from '@nestjs/cqrs';

/**
 * Create a mock EventPublisher for unit testing.
 *
 * `mergeObjectContext` returns the object unchanged, matching real behavior.
 */
export function createMockEventPublisher(): jest.Mocked<EventPublisher> {
  return {
    mergeObjectContext: jest.fn((obj: unknown) => obj),
  } as unknown as jest.Mocked<EventPublisher>;
}
