import { PlainLiteralObject } from '@nestjs/common';

import { WhereCondition } from '@concepta/nestjs-common';

import { CrudResponsePaginatedInterface } from '../../../infrastructure/dtos/interfaces/crud-response-paginated.interface';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudParsedQueryInterface } from '../../../infrastructure/request/interfaces/crud-parsed-query.interface';

import { createTestContext } from './crud-federation-test-entities';
import { HandlerSpy } from './crud-federation-test-setup';

// Type definitions for better type safety
interface RootWithRelations {
  id: number;
  [key: string]: unknown;
}

// Get the context from a handler spy's calls
// The spies receive CrudContextInterface directly from resolver methods
const getSpyCall = (spy: HandlerSpy, callIndex: number = 0) => {
  const context = spy.mock.calls[callIndex]?.[0];
  expect(context).toBeDefined();
  return context;
};

/**
 * Shared assertion utilities for federation tests
 * Reduces boilerplate and ensures consistent verification patterns
 */

// Handler call sequencing verification - root called before all relation services
export const assertRootFirst = (
  rootHandler: HandlerSpy,
  relationHandlers: HandlerSpy[],
) => {
  const rootCallOrder = rootHandler.mock.invocationCallOrder[0];
  expect(rootCallOrder).toBeDefined();

  relationHandlers.forEach((relationHandler) => {
    const relationCallOrder = relationHandler.mock.invocationCallOrder[0];
    expect(relationCallOrder).toBeGreaterThan(rootCallOrder);
  });
};

// Handler call sequencing verification - relation services called before root
export const assertRelationFirst = (
  rootHandler: HandlerSpy,
  relationHandlers: HandlerSpy[],
) => {
  const rootCallOrder = rootHandler.mock.invocationCallOrder[0];
  expect(rootCallOrder).toBeDefined();

  relationHandlers.forEach((relationHandler) => {
    const relationCallOrder = relationHandler.mock.invocationCallOrder[0];
    expect(rootCallOrder).toBeGreaterThan(relationCallOrder);
  });
};

// LEFT JOIN behavior verification - root query has no filter constraints
export const assertLeftJoinBehavior = (rootHandler: HandlerSpy) => {
  const context = getSpyCall(rootHandler);

  // Root query should have no filter constraints (LEFT JOIN)
  expect(context.query.filter).toEqual([]);
};

// INNER JOIN behavior verification
export const assertInnerJoinBehavior = (
  rootHandler: HandlerSpy,
  relationHandler: HandlerSpy,
  expectedRelationFilter: WhereCondition<PlainLiteralObject>[],
  expectedRootFilter: WhereCondition<PlainLiteralObject>[],
) => {
  const relationContext = getSpyCall(relationHandler);
  const rootContext = getSpyCall(rootHandler);

  // Relation query gets the explicit filters
  expect(relationContext.query.filter).toEqual(expectedRelationFilter);

  // Root query gets ID constraint from discovered relations
  expect(rootContext.query.filter).toEqual(expectedRootFilter);

  // Verify relation called first (INNER JOIN pattern)
  assertRelationFirst(rootHandler, [relationHandler]);
};

// Generic handler call counts - accepts array of handler-count pairs
export const assertHandlerCallCounts = (
  handlerCounts: Array<{
    handler: HandlerSpy;
    count: number;
  }>,
) => {
  handlerCounts.forEach(({ handler, count }) => {
    expect(handler.mock.calls.length).toBe(count);
  });
};

// Assert no relation handler calls (for no-relations scenarios)
export const assertNoRelationHandlerCalls = (relationHandler: HandlerSpy) => {
  expect(relationHandler.mock.calls.length).toBe(0);
};

// Properties that are auto-ignored when the caller didn't provide them.
// If the caller passes e.g. `filter:` in expectedQuery, it WILL be checked.
const AUTO_IGNORE_PROPS: Array<
  keyof CrudParsedQueryInterface<PlainLiteralObject>
> = ['filter', 'or', 'search'];

// Shared helper for asserting query params with query parameter filtering
const assertQueryParams = (
  actualContext: CrudContextInterface<PlainLiteralObject>,
  expectedQuery: Partial<CrudParsedQueryInterface<PlainLiteralObject>>,
  options: {
    ignore?: Array<keyof CrudParsedQueryInterface<PlainLiteralObject>>;
  } = {},
) => {
  // If caller provided explicit ignore list, use it.
  // Otherwise auto-ignore only properties NOT present in expectedQuery.
  const ignoreProps =
    options.ignore ??
    AUTO_IGNORE_PROPS.filter((prop) => !(prop in expectedQuery));

  // Create expected context with defaults
  const expected = createTestContext<PlainLiteralObject>();

  // Build expected query by merging defaults with overrides
  const mergedQuery = {
    ...expected.query,
    ...expectedQuery,
  };

  // Create copies for comparison with ignored properties removed
  const actualFiltered = { ...actualContext.query };
  const expectedFiltered = { ...mergedQuery };

  // Remove ignored properties from both objects
  for (const prop of ignoreProps) {
    delete actualFiltered[prop];
    delete expectedFiltered[prop];
  }

  // Compare filtered query objects
  expect(actualFiltered).toEqual(expectedFiltered);
};

// Core helper function for asserting handler queries
const assertHandlerQuery = (
  handler: HandlerSpy,
  expectedParsed: Partial<CrudParsedQueryInterface<PlainLiteralObject>>,
  callIndex: number = 0,
  options: {
    ignore?: Array<keyof CrudParsedQueryInterface<PlainLiteralObject>>;
  } = {},
) => {
  // getSpyCall returns the CrudContextInterface directly (not a query with .context)
  const context = getSpyCall(handler, callIndex);
  assertQueryParams(context, expectedParsed, options);
};

// Root list query verification - validates query matches expected exactly
export const assertRootListQuery = (
  rootHandler: HandlerSpy,
  expectedParsed: Partial<CrudParsedQueryInterface<PlainLiteralObject>>,
  callIndex: number = 0,
  options?: {
    ignore?: Array<keyof CrudParsedQueryInterface<PlainLiteralObject>>;
  },
) => {
  assertHandlerQuery(rootHandler, expectedParsed, callIndex, options);
};

// Root read query verification
export const assertRootReadQuery = (
  rootHandler: HandlerSpy,
  expectedParsed: Partial<CrudParsedQueryInterface<PlainLiteralObject>>,
  callIndex: number = 0,
  options?: {
    ignore?: Array<keyof CrudParsedQueryInterface<PlainLiteralObject>>;
  },
) => {
  assertHandlerQuery(rootHandler, expectedParsed, callIndex, options);
};

// Relation query verification - validates query matches expected exactly
export const assertRelationQuery = (
  relationHandler: HandlerSpy,
  expectedQuery: Partial<CrudParsedQueryInterface<PlainLiteralObject>>,
  callIndex: number = 0,
  options?: {
    ignore?: Array<keyof CrudParsedQueryInterface<PlainLiteralObject>>;
  },
) => {
  assertHandlerQuery(relationHandler, expectedQuery, callIndex, options);
};

// Result structure verification - checks all response properties and data contents
export const assertResultStructure = (
  result: CrudResponsePaginatedInterface<RootWithRelations>,
  expected: Partial<CrudResponsePaginatedInterface<RootWithRelations>> &
    Pick<CrudResponsePaginatedInterface<RootWithRelations>, 'count' | 'total'>,
) => {
  // Required properties - always checked
  expect(result.total).toBe(expected.total);
  expect(result.count).toBe(expected.count);

  if (expected.data !== undefined) {
    expect(result.data).toEqual(expected.data);
  }

  // Optional properties - checked only if provided for backward compatibility
  if (expected.limit !== undefined) {
    expect(result.limit).toBe(expected.limit);
  }

  if (expected.page !== undefined) {
    expect(result.page).toBe(expected.page);
  }

  if (expected.pageCount !== undefined) {
    expect(result.pageCount).toBe(expected.pageCount);
  }

  // Metrics - optional nested object
  if (expected.metrics !== undefined) {
    expect(result.metrics).toEqual(expected.metrics);
  }
};

// Combined enrichment verification - property + mappings
export const assertEnrichment = (
  result: CrudResponsePaginatedInterface<RootWithRelations>,
  relationProperty: string,
  expectedMappings: Record<number, unknown[]>,
) => {
  // Check that all roots have the relation property
  result.data.forEach((root: RootWithRelations) => {
    expect(root).toHaveProperty(relationProperty);
    expect(Array.isArray(root[relationProperty])).toBe(true);
  });

  // Verify specific root-relation mappings
  const rootById = new Map(
    result.data.map((r: RootWithRelations) => [r.id, r]),
  );

  Object.entries(expectedMappings).forEach(([rootId, expectedRelations]) => {
    const root = rootById.get(Number(rootId));
    expect(root).toBeDefined();
    if (root) {
      const relationValue = root[relationProperty] as unknown[];
      expect(relationValue).toHaveLength(expectedRelations.length);

      expectedRelations.forEach((expectedRelation) => {
        expect(relationValue).toContainEqual(expectedRelation);
      });
    }
  });
};

// One-to-one enrichment verification - property can be single object or null
export const assertOneToOneEnrichment = (
  result: CrudResponsePaginatedInterface<RootWithRelations>,
  relationProperty: string,
  expectedMappings: Record<number, unknown | null>,
) => {
  const rootById = new Map(
    result.data.map((r: RootWithRelations) => [r.id, r]),
  );

  // Verify all roots have the property
  result.data.forEach((root: RootWithRelations) => {
    expect(root).toHaveProperty(relationProperty);
  });

  // Verify specific mappings (object or null)
  Object.entries(expectedMappings).forEach(([rootId, expectedValue]) => {
    const root = rootById.get(Number(rootId));
    expect(root).toBeDefined();
    if (root) {
      if (expectedValue === null) {
        expect(root[relationProperty]).toBeNull();
      } else {
        expect(root[relationProperty]).toEqual(expectedValue);
      }
    }
  });
};

// Sort order verification using ID sequences
export const assertSortOrder = (
  result: CrudResponsePaginatedInterface<RootWithRelations>,
  expectedIdSequence: number[],
) => {
  expectedIdSequence.forEach((expectedId, index) => {
    expect(result.data[index].id).toBe(expectedId);
  });
};

// Empty result verification
export const assertEmptyResult = (
  result: CrudResponsePaginatedInterface<unknown>,
) => {
  expect(result.data).toEqual([]);
  expect(result.count).toBe(0);
  expect(result.total).toBe(0);
  expect(result.page).toBe(1);
  // pageCount and limit can vary, so just verify they exist
  expect(result.pageCount).toBeGreaterThanOrEqual(0);
  expect(result.limit).toBeGreaterThanOrEqual(1);
};

// Relation sort behavior verification - relation query called first with filter and sort
export const assertRelationSortBehavior = (
  rootHandler: HandlerSpy,
  relationHandler: HandlerSpy,
  expectedRelationFilter: WhereCondition<PlainLiteralObject>[],
  expectedRelationSort: Array<{ field: string; order: string }>,
) => {
  const relationCall = getSpyCall(relationHandler);

  // Relation query gets the filters and sort
  expect(relationCall.query.filter).toEqual(expectedRelationFilter);
  expect(relationCall.query.sort).toEqual(expectedRelationSort);

  // Verify relation called first (relation-sort pattern)
  assertRelationFirst(rootHandler, [relationHandler]);
};

// Relation sort validation error verification
export const assertRelationSortValidationError = (
  error: Error,
  relationFieldOrMessage?: string,
) => {
  const CrudQueryException = error.constructor;
  expect(error).toBeInstanceOf(CrudQueryException);
  expect(error.message).toContain('distinctFilter configuration');

  // If a specific field or message is provided, check for it
  // This is optional since the error message format changed
  if (relationFieldOrMessage) {
    expect(error.message).toContain(relationFieldOrMessage);
  }
};
