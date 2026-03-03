/**
 * Describes how to join a related entity.
 *
 * When `on` is omitted, the repository resolves FK mapping
 * from its own metadata via `resolveJoinClauses()`.
 *
 * @example Simple FK join (blog.userId → user.id):
 * ```typescript
 * { relation: 'blog', on: { from: 'id', to: 'userId' } }
 * ```
 *
 * @example Join resolved from repository metadata:
 * ```typescript
 * { relation: 'blog' }
 * ```
 *
 * @example Many-to-many through junction (user ↔ pet via userPet):
 * ```typescript
 * {
 *   relation: 'pet',
 *   on: { from: 'id', to: 'id' },
 *   through: { relation: 'userPet', fromKey: 'userId', toKey: 'petId' },
 * }
 * ```
 */
export interface JoinClause {
  /** Relation or entity name to join. */
  relation: string;

  /** FK mapping. Optional — if omitted, resolved from repository metadata. */
  on?: {
    /** Column on the source entity (e.g., 'id'). */
    from: string;
    /** Column on the target entity (e.g., 'userId'). */
    to: string;
  };

  /** For many-to-many: junction entity info. */
  through?: {
    /** Junction entity or table name. */
    relation: string;
    /** Junction FK column pointing to the source entity. */
    fromKey: string;
    /** Junction FK column pointing to the target entity. */
    toKey: string;
  };

  /** Join semantics: 'LEFT' (default) or 'INNER'. */
  joinType?: 'LEFT' | 'INNER';

  /** Relation multiplicity: 'one' (default) or 'many'. */
  cardinality?: 'one' | 'many';
}
