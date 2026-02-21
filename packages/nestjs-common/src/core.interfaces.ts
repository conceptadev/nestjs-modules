export interface DomainFactory<Entity, Creatable, Domain> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (entity: Entity, ...args: any[]): Domain;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(props: Creatable, ...args: any[]): Domain;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toInstance(entity: Entity, ...args: any[]): Domain;
}

export interface DomainMappable<T> {
  toPlain(): T;
  hydrate(entity: T): void;
}
