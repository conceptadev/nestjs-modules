import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { EventPublisher } from '@nestjs/cqrs';

/**
 * Create a mock EventPublisher for unit testing.
 *
 * `mergeObjectContext` returns the object unchanged, matching real behavior.
 */
export function createMockEventPublisher(): DeepMockProxy<EventPublisher> {
  const publisher = mockDeep<EventPublisher>();
  publisher.mergeObjectContext.mockImplementation((obj) => obj);
  return publisher;
}
