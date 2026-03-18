import { EventContextHost } from '../events/event-context.host';
import { EntityHeaderInterface } from '../events/headers/interfaces/entity-header.interface';

/**
 * Create a mock EventContextHost for unit testing.
 *
 * @param entity - The entity key to set in the header
 */
export function createMockEventContext(
  entity: string,
): EventContextHost<EntityHeaderInterface> {
  return EventContextHost.builder<EntityHeaderInterface>()
    .setHeader('entity', entity)
    .build();
}
