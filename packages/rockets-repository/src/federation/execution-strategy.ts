import { OrderClause, OrderSortKey } from '../repository/repository.types';

import { FederationException } from './exceptions/federation.exception';
import { FederatedRelation, FederationStrategy } from './federation.types';
import { FilterAnalyzer } from './filter-analyzer';
import { ExecutionAnalysis } from './interfaces/execution-analysis.interface';

export { ExecutionAnalysis } from './interfaces/execution-analysis.interface';

/**
 * Analyze the query to determine execution strategy and separate
 * root vs relation order sort keys.
 *
 * Strategy selection:
 * - ROOT_FIRST: No relation sorts or filters. Fetch roots, then enrich.
 * - RELATION_FIRST: Has relation sorts or filters. Discover root IDs
 *   via relation queries first, then fetch matching roots.
 */
export function analyzeExecution(
  filterAnalyzer: FilterAnalyzer,
  order: OrderClause | undefined,
  relations: FederatedRelation[],
): ExecutionAnalysis {
  const { rootOrder, relationOrders, sortedRelationNames, drivingRelation } =
    separateOrder(order, relations);

  validateRelationSorts(sortedRelationNames, relations);

  // Driving relation: first with sort, then first with filter
  const effectiveDrivingRelation =
    drivingRelation ??
    relations.find((r) => filterAnalyzer.hasFiltersForRelation(r));

  const hasRelationSorts = sortedRelationNames.size > 0;
  const hasRelationFilters = filterAnalyzer.hasRelationFilters(relations);

  const strategy =
    hasRelationSorts || hasRelationFilters
      ? FederationStrategy.RELATION_FIRST
      : FederationStrategy.ROOT_FIRST;

  return {
    strategy,
    rootOrder,
    relationOrders,
    drivingRelation: effectiveDrivingRelation,
    sortedRelationNames,
    filterAnalyzer,
  };
}

/**
 * Separate OrderClause into root vs relation parts.
 *
 * Sort keys whose `relation` matches a federated relation name
 * are extracted as relation orders. Everything else is a root order.
 */
function separateOrder(
  order: OrderClause | undefined,
  relations: FederatedRelation[],
): {
  rootOrder: OrderClause | undefined;
  relationOrders: Map<string, OrderClause>;
  sortedRelationNames: Set<string>;
  drivingRelation: FederatedRelation | undefined;
} {
  if (!order || order.length === 0) {
    return {
      rootOrder: undefined,
      relationOrders: new Map(),
      sortedRelationNames: new Set(),
      drivingRelation: undefined,
    };
  }

  const relationsByName = new Map(relations.map((r) => [r.name, r]));
  const rootKeys: OrderSortKey[] = [];
  const relationOrders = new Map<string, OrderSortKey[]>();
  const sortedRelationNames = new Set<string>();
  let drivingRelation: FederatedRelation | undefined;

  for (const key of order) {
    const relation = key.relation
      ? relationsByName.get(key.relation)
      : undefined;

    if (relation && key.relation) {
      const arr = relationOrders.get(key.relation) ?? [];
      arr.push(key);
      relationOrders.set(key.relation, arr);
      sortedRelationNames.add(key.relation);
      if (!drivingRelation) drivingRelation = relation;
    } else {
      rootKeys.push(key);
    }
  }

  return {
    rootOrder: rootKeys.length > 0 ? rootKeys : undefined,
    relationOrders,
    sortedRelationNames,
    drivingRelation,
  };
}

/**
 * Validate that many-cardinality relations being sorted have distinctFilter.
 */
function validateRelationSorts(
  sortedRelationNames: Set<string>,
  relations: FederatedRelation[],
): void {
  for (const name of sortedRelationNames) {
    const relation = relations.find((r) => r.name === name);
    if (
      relation &&
      relation.cardinality === 'many' &&
      !relation.distinctFilter
    ) {
      throw new FederationException({
        message:
          'Sorting on many-cardinality relation "%s" requires distinctFilter configuration',
        messageParams: [name],
      });
    }
  }
}
