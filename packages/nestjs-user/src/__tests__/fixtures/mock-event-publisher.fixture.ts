import { EventPublisher } from '@nestjs/cqrs';

export function createMockEventPublisher(): jest.Mocked<EventPublisher> {
  return {
    mergeObjectContext: jest.fn().mockImplementation((obj) => {
      obj.commit = jest.fn();
      obj.uncommit = jest.fn();
      return obj;
    }),
  } as unknown as jest.Mocked<EventPublisher>;
}
