# CRUD Federation Service - Test Scenarios

> **Last Updated**: September 14, 2025 - Updated based on current
> implementation and test coverage analysis

## Overview

This document tracks test scenario definitions and coverage status for the
`CrudFederationService`.

**📋 Documentation references**:

- `CLAUDE.md` - Architecture overview and testing guidance for Claude Code
- `FEDERATION_TEST_STYLE.md` - Detailed testing patterns and anti-patterns

### Federation Scope

- **Current Implementation**: Supports both `list` and `read` operations
  with relationship-aware data fetching
- **Federation Patterns**: Handles forward relationships (fully tested),
  inverse relationships (implementation exists, limited testing), constraint
  enforcement, cross-service coordination
- **JOIN Types**: LEFT JOIN (default), INNER JOIN (via filters or `join:
  'INNER'` property)
- **Optimization Features**: Intelligent caching, minimal API call strategies

### Query Strategy

- **Root-First Approach** (LEFT JOIN): Used when no relation filters exist.
  Fetches roots first, then relations with `rootId: { $in: [...] }`
  constraints to prevent unbounded relation queries
- **Relation-First Approach** (INNER JOIN): Used when relation filters exist.
  Fetches relations first with filters, then roots constrained by discovered
  root IDs

## Core Federation Scenarios

### 1. Service Coordination Patterns

**Test File**: `behavior/service-coordination.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Cross-cutting service coordination patterns that apply to all
  relationship types
- **Expected**: Consistent parameter passing and filter delegation regardless
  of cardinality
- **Test Cases**: Parameter passing, request construction, filter delegation

### 2. No Relations Query

**Test File**: `behavior/no-relations.spec.ts` | **Status**: ✅ Implemented &
Complete

- **Scenario**: Root query with no relation entities
- **Expected**: Direct root handler call, no federated logic
- **Test Cases**: ✅ Simple root fetch with pagination, filters, sorting

### 3. One-to-One (Forward) Relationships

**Test File**: `integration/one-to-one-forward.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Root has single related entity (`Root.profile` ←
  `Profile.rootId`)
- **Expected**: Root-first discovery, single entity enrichment (LEFT JOIN
  behavior)
- **Test Cases**:
  - ✅ Root with existing related entity - entity object populated
  - ✅ Root with missing related entity - null object, root still included
  - ✅ Root with multiple relationships
  - ✅ **Pagination**: Page-based pagination (always paginate mode enforced,
    offset calculated internally)
    - ✅ Page 1 and Page 2 with profile enrichment
    - ✅ Null profile handling across pages
  - ❌ **Edge Cases**: Empty results, single record, null foreign keys

### 4. One-to-Many (Forward) Relationships

**Test File**: `integration/one-to-many-forward.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Root has relations collection (`Root.relations[]` ←
  `Relation.rootId`)
- **Expected**: Root-first discovery, relations enrichment (LEFT JOIN
  behavior)
- **Test Cases**:
  - ✅ Root with multiple relations - all relations returned in collection
  - ✅ Root with no relations - empty collection, root still included
  - ✅ Root with single relation - relation returned in collection
  - ✅ Root with multiple relationships
  - ✅ Multiple roots with varying relation counts
  - ✅ **Pagination**: Page-based pagination (always paginate mode enforced,
    offset calculated internally)
    - ✅ Page 2 with relation collection enrichment
  - ✅ **Edge Cases**: Query beyond available pages, single result, zero
    results, partial last page

### 5. One-to-One (Inverse) Relationships

**Test File**: `integration/one-to-one-inverse.spec.ts` | **Status**: ❌
Missing Tests

- **Scenario**: Profile-driven query with Root enrichment (`Profile.root` ←
  `Root.id` via `Profile.rootId`)
- **Expected**: Profile service drives, Root service follows with enrichment
  (LEFT JOIN behavior)
- **Note**: Feature implementation exists (`owner: true` relationships), but
  dedicated integration tests are missing
- **Test Cases**:
  - Profile with existing related Root - root object populated
  - Profile with missing related Root - null root, profile still included
  - **Pagination**: Page-based pagination (always paginate mode enforced,
    offset calculated internally)
  - **Edge Cases**: Empty results, single record, null foreign keys

### 6. One-to-Many (Inverse) Relationships

**Test File**: `integration/one-to-many-inverse.spec.ts` | **Status**: ❌
Missing Tests

- **Scenario**: Relation-driven query with Root enrichment (`Relation.root` ←
  `Root.id` via `Relation.rootId`)
- **Expected**: Relation service drives, Root service follows with enrichment
  (LEFT JOIN behavior)
- **Note**: Feature implementation exists (`owner: true` relationships), but
  dedicated integration tests are missing
- **Test Cases**:
  - Collection of relations with existing roots - each relation gets their
    one root
  - Collection of relations with missing roots - some relations have null
    root
  - Collection of relations sharing same root - multiple relations reference
    same root ID
  - **Pagination**: Page-based pagination (always paginate mode enforced,
    offset calculated internally)
  - **Edge Cases**: Empty results, single record, null foreign keys

### 7. Mixed Relationship Types

**Test File**: `integration/mixed-relations.spec.ts` | **Status**: ❌
Missing Tests

- **Scenario**: Root with both forward and inverse relationships
- **Expected**: Both forward and inverse relations enrich, LEFT JOIN behavior
- **Note**: Feature implementation exists, but dedicated integration tests are
  missing
- **Test Cases**:
  - Various combinations of forward/inverse data presence
  - **Pagination**: Complex pagination with mixed relationship types
  - **Edge Cases**: Partial enrichment scenarios

## Join Behavior Scenarios

### 8. INNER JOIN via Filters

**Test File**: `behavior/inner-join-behavior.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Achieving INNER JOIN through explicit relation filters
- **Expected**: Only roots with matching relations returned
- **Test Cases**:
  - ✅ `relations.rootId||$nnull` - Existence filter triggers INNER JOIN
  - ✅ `relations.status||$eq||active` - Value filters trigger INNER JOIN
  - ✅ Multiple relation filters (AND condition) - Combined filters
    constrain roots
  - ✅ No matching relations - Returns empty result without root query
  - ✅ Root + relation filters combined - INNER JOIN with root-side
    filtering
  - ✅ **Pagination**: Page 1, Page 2, and edge cases with INNER JOIN
    behavior
    - ✅ Relation filter with pagination constraints
    - ✅ Filter reducing results below page size

**Examples**:

```text
// Left join (default) - returns all roots
GET /roots?join=relations

// Inner join - only roots with relations  
GET /roots?join=relations&filter=relations.rootId||$nnull
```

### 9. Join Type Control

**Test File**: `behavior/join-type.spec.ts` | **Status**: ✅ Implemented &
Complete

- **Scenario**: Explicit control of JOIN behavior via `join` property on
  relations
- **Expected**: LEFT JOIN (default), INNER JOIN via `join: 'INNER'` with
  automatic $nnull injection
- **Test Cases**:
  - ✅ Default LEFT JOIN behavior (no join property specified)
  - ✅ Explicit LEFT JOIN via `join: 'LEFT'`
  - ✅ INNER JOIN via `join: 'INNER'` with automatic $nnull filter
    injection
  - ✅ Preservation of existing filters when injecting $nnull for INNER
    join

## Filter and Sort Scenarios

### 10. Filter Delegation

**Test File**: `behavior/filter-delegation.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Root vs relation filter routing
- **Expected**: Root filters → root service, relation filters → relation
  service
- **Test Cases**: Mixed root/relation filters, prefix removal

### 11. Sort Delegation

**Test File**: `behavior/sort-delegation.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Root vs relation sort strategies with validation
- **Expected**: Root sort allows LEFT JOIN, relation sort requires INNER JOIN
  (AND NOT_NULL filter on join key)
- **Test Cases**:
  - Root sort with LEFT JOIN behavior
  - Relation sort with valid NOT_NULL join key filter (success)
  - Relation sort without NOT_NULL join key filter (error)

### 12. Root Sort Strategy

**Test File**: `behavior/root-sort-behavior.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Sorting on root fields only (LEFT JOIN compatible)
- **Expected**: Root-driven sorting with all roots returned, no constraint
  validation needed
- **Test Cases**:
  - ✅ Single root field sort (name ASC, id DESC) - LEFT JOIN behavior
    with all roots
  - ✅ Multiple root field sorts - Combined sort criteria with LEFT JOIN
  - ✅ Root sort with pagination - Offset/limit integrity maintained
  - ✅ Root sort with root filters - Combined filtering and sorting
  - ✅ LEFT JOIN guarantee - All roots returned regardless of relation
    existence

### 13. Relation Sort Strategy with Validation

**Test File**: `behavior/relation-sort-behavior.spec.ts` +
`behavior/relation-sort-validation.spec.ts` | **Status**: ✅ Implemented &
Complete

- **Scenario**: Sorting on relation fields with comprehensive validation
  (INNER JOIN required)
- **Expected**: Relation-driven sorting with mandatory AND filter on join
  key, proper error handling
- **Test Cases**:
  - ✅ Relation sort with `relations.rootId||$nnull` (forward
    relationship)
  - ✅ Relation sort with additional AND filters
  - ✅ Root deduplication when multiple relations match
  - ✅ Empty result when no relations match with sort
  - ✅ Relation sort with pagination correctly applied (page 1)
  - ✅ **Validation Cases**:
    - ✅ Relation sort without any filters → Error with join key filter
      suggestion
    - ✅ Relation sort with unrelated relation filters → Error requires
      join key filter
    - ✅ Relation sort with non-$nnull filters → Error requires
      $nnull filter
    - ✅ Valid relation sort with $nnull filter → Success
    - ✅ Valid relation sort with $nnull + additional filters →
      Success

### 14. Combined Root+Relation Filters

**Test File**: `behavior/combined-filters.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Queries with both root-side and relation-side filters
  applied simultaneously
- **Expected**: Proper filter delegation and INNER JOIN behavior when
  relation filters present
- **Test Cases**:
  - ✅ Root filter + relation filter with page 1 and page 2
  - ✅ Multiple root filters + multiple relation filters (complex AND
    conditions)
  - ✅ Combined filters reducing results below page size
  - ✅ **Pagination**: Full pagination coverage with combined filtering
    - ✅ Page 1 and Page 2 with root + relation filters
    - ✅ Multiple filter combinations across pages

### 15. Combined Sort Strategies

**Test File**: `behavior/combined-sorts.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Queries with both root and relation sort fields specified
- **Expected**: Proper validation and error handling for unsupported
  combinations
- **Test Cases**:
  - Root sort + relation sort → Error (unsupported combination)
  - Sort field precedence analysis
  - Error message clarity for mixed sort scenarios

## Performance Scenarios

### 16. Distinct Filter Validation

**Test File**: `behavior/distinct-filter-validation.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Validation of distinctFilter requirements for
  many-cardinality relations
- **Expected**: Many-cardinality relations require distinctFilter,
  one-cardinality relations do not
- **Test Cases**:
  - ✅ Error when many-cardinality relation lacks distinctFilter
  - ✅ Success when many-cardinality relation has distinctFilter and $nnull
  - ✅ Requirement for $nnull filter even with distinctFilter
  - ✅ One-cardinality relations work without distinctFilter

### 17. API Call Optimization

**Test File**: `e2e/performance.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Minimizing handler calls
- **Expected**: 3 calls for typical root+2relations scenario
- **Test Cases**: Single relation (2 calls), multiple relations (3 calls)

### 18. Read Hydration

**Test File**: `integration/get-one-hydration.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Single entity retrieval with relation hydration
- **Expected**: Root retrieved via read, relations fetched and attached
- **Test Cases**:
  - ✅ Read with one-to-many forward relations
  - ✅ Read with one-to-one forward relations
  - ✅ Read with multiple relation types
  - ✅ Read with no matching relations (empty arrays/null values)

## Error Handling Scenarios

### 19. Service Errors

**Test File**: `e2e/error-handling.spec.ts` | **Status**: ❌ Missing

- **Scenario**: Relation services throwing errors
- **Expected**: Proper error propagation with context
- **Test Cases**: Service unavailable, timeout, connection issues

### 20. Unsupported Query Features Validation

**Test File**: `behavior/unsupported-features.spec.ts` | **Status**: ✅
Implemented & Complete

- **Scenario**: Validation of unsupported search and OR filter features
- **Expected**: Clear error messages when unsupported query features are
  used
- **Test Cases**:
  - ✅ Search via query string (`req.parsed.search`) throws error
  - ✅ OR filter via query string (`req.parsed.or`) throws error
  - ✅ Combined search and OR filters (search error takes precedence)
  - ✅ Validation in `list` method (metrics available when
    `includeMetrics: true`)
  - ✅ Empty OR array allowed (no error)

## Test Category Overview

> **Note**: For detailed test organization and placement guidance, see
> `CLAUDE.md` in this directory.

### Test Categories Summary

- **Unit** (`crud-federation-unit/`) - Pure functions and calculations
- **Behavior** (`crud-federation-behavior/`) - Core patterns (JOIN logic,
  delegation)
- **Integration** (`crud-federation-integration/`) - Service coordination
  per relationship type
- **E2E** (`crud-federation-e2e/`) - Complete scenarios [Future]

### Test Coverage Summary

- ✅ **Implemented**: 12 scenarios fully covered (including comprehensive
  pagination, JOIN control, distinct filter validation, read hydration)
- ❌ **Missing**: 9 scenarios not yet tested (inverse relationships, unit
  tests, performance tests)

**Total Scenarios**: 21 (updated based on current implementation)

**Total Test Cases**: 50+ (across 12 implemented scenarios with comprehensive coverage)

## Testing Gaps and Implementation Plan

### Current State Analysis

Based on the streamlined scenario mapping:

**✅ Well Covered (12 scenarios)**:

- No relations query
- Forward relationships (one-to-one & one-to-many) with comprehensive
  enrichment and pagination tests
- INNER JOIN behavior with comprehensive filter testing
- Join type control (LEFT/INNER via join property)
- Root sort behavior with comprehensive testing
- Relation sort with validation and error handling
- Combined root+relation filters with pagination
- Distinct filter validation for many-cardinality relations
- Read hydration with multiple relation types
- Unsupported query features validation

**❌ Missing Implementation (9 scenarios)**:

- Inverse relationships (one-to-one & one-to-many) - Feature
  implementation exists (`owner: true`) but missing dedicated integration
  tests
- Mixed relationship types - Feature exists but missing integration tests
- Service coordination patterns
- Filter delegation (partially tested in integration, needs extraction to
  behavior)
- Sort delegation
- Combined sort strategies
- API call optimization (performance tests)
- Service error handling

### Implementation Priorities

#### Phase 1: Complete Core Behavior Tests (High Priority)

- Extract `behavior/filter-delegation.spec.ts` from integration tests
- Create `behavior/sort-delegation.spec.ts`
- Create `behavior/combined-sorts.spec.ts`
- Add `e2e/performance.spec.ts` for API call optimization verification

#### Phase 2: Inverse Relationships Testing (Medium Priority)

- `integration/one-to-one-inverse.spec.ts` - Test owner: true relationships
- `integration/one-to-many-inverse.spec.ts` - Test inverse collections
- `integration/mixed-relations.spec.ts` - Test forward + inverse combinations

#### Phase 3: Performance and Error Handling (Lower Priority)

- `e2e/error-handling.spec.ts` - Service failures and recovery
- `e2e/performance.spec.ts` - API call optimization verification

### Prevention Strategy

- Use the scenario mapping table above as authoritative source
- Before writing tests, check the mapping table
- Each scenario should have exactly one test location
- Feature implementation exists for inverse relationships but needs
  comprehensive testing
