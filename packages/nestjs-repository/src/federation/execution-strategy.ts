import { RepositoryOrderOptions } from '@concepta/nestjs-common';

import { FederationException } from './exceptions/federation.exception';
import { FederatedRelation, FederationStrategy } from './federation.types';
import { FilterAnalyzer } from './filter-analyzer';
import { ExecutionAnalysis } from './interfaces/execution-analysis.interface';

export { ExecutionAnalysis } from './interfaces/execution-analysis.interface';

/**
 * Analyze the query to determine execution strategy and separate
 * root vs relation order options.
 *
 * Strategy selection:
 * - ROOT_FIRST: No relation sorts or filters. Fetch roots, then enrich.
 * - RELATION_FIRST: Has relation sorts or filters. Discover root IDs
 *   via relation queries first, then fetch matching roots.
 */
export function analyzeExecution(
  filterAnalyzer: FilterAnalyzer,
  order: RepositoryOrderOptions | undefined,
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
 * Separate RepositoryOrderOptions into root vs relation parts.
 *
 * Top-level keys matching a federated relation name (with object values)
 * are extracted as relation orders. Everything else is a root order.
 */
function separateOrder(
  order: RepositoryOrderOptions | undefined,
  relations: FederatedRelation[],
): {
  rootOrder: RepositoryOrderOptions | undefined;
  relationOrders: Map<string, RepositoryOrderOptions>;
  sortedRelationNames: Set<string>;
  drivingRelation: FederatedRelation | undefined;
} {
  if (!order) {
    return {
      rootOrder: undefined,
      relationOrders: new Map(),
      sortedRelationNames: new Set(),
      drivingRelation: undefined,
    };
  }

  const relationsByName = new Map(relations.map((r) => [r.name, r]));
  const rootOrder: RepositoryOrderOptions = {};
  const relationOrders = new Map<string, RepositoryOrderOptions>();
  const sortedRelationNames = new Set<string>();
  let drivingRelation: FederatedRelation | undefined;

  for (const [key, value] of Object.entries(order)) {
    const relation =
      typeof value === 'object' && value !== null
        ? relationsByName.get(key)
        : undefined;

    if (relation) {
      relationOrders.set(key, value as RepositoryOrderOptions);
      sortedRelationNames.add(key);
      if (!drivingRelation) drivingRelation = relation;
    } else {
      rootOrder[key] = value;
    }
  }

  return {
    rootOrder: Object.keys(rootOrder).length > 0 ? rootOrder : undefined,
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
