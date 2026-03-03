import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

export function mockRelationMetadata(
  overrides: Record<string, unknown>,
): RelationMetadata {
  return {
    isOneToMany: false,
    isManyToMany: false,
    isManyToManyOwner: false,
    isOwning: false,
    joinColumns: [],
    inverseJoinColumns: [],
    ...overrides,
  } as unknown as RelationMetadata;
}
