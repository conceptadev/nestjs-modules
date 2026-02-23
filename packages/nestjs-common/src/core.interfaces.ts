import { EventContextInterface } from './events/interfaces/event-context-interface';

export interface DomainFactory<Entity, Creatable, Domain> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): Domain;

  create(
    eventContext: EventContextInterface,
    props: Creatable,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Domain;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toInstance(entity: Entity, ...args: any[]): Domain;
}

export interface DomainMappable<T> {
  toPlain(): T;
  hydrate(entity: T): void;
}
