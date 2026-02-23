import {
  TestRoot,
  TestRelation,
  TestProfile,
  TestSettings,
} from './crud-federation-test-entities';

/**
 * Preset data builders for federation tests
 * Provides minimal, focused datasets to reduce test verbosity
 */

// Minimal root-relation dataset (2-3 entities for basic tests)
export const createMinimalRootRelationSet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
    { id: 3, name: 'Root 3' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1', isLatest: true },
    { id: 2, rootId: 2, title: 'Relation 2', isLatest: true },
    { id: 3, rootId: 2, title: 'Relation 3', isLatest: false },
    // Root 3 has no relations - useful for LEFT JOIN tests
  ] as TestRelation[],
});

// Filtered dataset with mixed active/inactive states
export const createFilteredDataSet = () => ({
  roots: [
    { id: 1, name: 'Active Root' },
    { id: 2, name: 'Mixed Root' },
    { id: 3, name: 'Inactive Root' },
  ] as TestRoot[],

  activeRelations: [
    { id: 1, rootId: 1, title: 'Active Task', status: 'active' },
    { id: 2, rootId: 2, title: 'Active Item', status: 'active' },
  ] as (TestRelation & { status: string })[],

  allRelations: [
    { id: 1, rootId: 1, title: 'Active Task', status: 'active' },
    { id: 2, rootId: 2, title: 'Active Item', status: 'active' },
    { id: 3, rootId: 2, title: 'Pending Item', status: 'pending' },
    { id: 4, rootId: 3, title: 'Inactive Task', status: 'inactive' },
  ] as (TestRelation & { status: string })[],
});

// Multi-priority dataset for complex filtering
export const createPriorityDataSet = () => ({
  roots: [
    { id: 1, name: 'High Priority Project' },
    { id: 2, name: 'Mixed Priority Project' },
  ] as TestRoot[],

  highPriorityActiveRelations: [
    {
      id: 1,
      rootId: 1,
      title: 'Critical Bug',
      status: 'active',
      priority: 10,
    },
    {
      id: 2,
      rootId: 2,
      title: 'Important Feature',
      status: 'active',
      priority: 8,
    },
  ] as (TestRelation & { status: string; priority: number })[],

  allRelations: [
    {
      id: 1,
      rootId: 1,
      title: 'Critical Bug',
      status: 'active',
      priority: 10,
    },
    {
      id: 2,
      rootId: 2,
      title: 'Important Feature',
      status: 'active',
      priority: 8,
    },
    { id: 3, rootId: 1, title: 'Minor Fix', status: 'active', priority: 3 },
    { id: 4, rootId: 2, title: 'Old Task', status: 'completed', priority: 9 },
  ] as (TestRelation & { status: string; priority: number })[],
});

// Sort order dataset with predictable names
export const createSortDataSet = () => ({
  rootsByName: [
    { id: 3, name: 'Alpha Project' },
    { id: 1, name: 'Beta Project' },
    { id: 2, name: 'Gamma Project' },
  ] as TestRoot[],

  rootsById: [
    { id: 3, name: 'Project C' },
    { id: 2, name: 'Project B' },
    { id: 1, name: 'Project A' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Task A' },
    { id: 2, rootId: 2, title: 'Task B' },
    { id: 3, rootId: 3, title: 'Task C' },
  ] as TestRelation[],
});

// Root sort behavior datasets for LEFT JOIN tests
export const createNameSortDataSet = () => ({
  roots: [
    { id: 1, name: 'Root A' },
    { id: 3, name: 'Root B' },
    { id: 2, name: 'Root C' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1' },
    { id: 2, rootId: 3, title: 'Relation 2' },
    // Root 2 has no relations
  ] as TestRelation[],
});

export const createIdDescSortDataSet = () => ({
  roots: [
    { id: 3, name: 'Root 5' },
    { id: 4, name: 'Root 4' },
    { id: 5, name: 'Root 3' },
    { id: 2, name: 'Root 2' },
    { id: 1, name: 'Root 1' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 2, title: 'Relation 1' },
    { id: 2, rootId: 4, title: 'Relation 2' },
    { id: 3, rootId: 4, title: 'Relation 3' },
  ] as TestRelation[],
});

export const createMultiSortDataSet = () => ({
  roots: [
    { id: 3, name: 'Root A' },
    { id: 1, name: 'Root A' },
    { id: 2, name: 'Root B' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1' },
    { id: 2, rootId: 1, title: 'Relation 2' },
    { id: 3, rootId: 3, title: 'Relation 3' },
    // Root 2 has no relations
  ] as TestRelation[],
});

// Multi-relation dataset (root with multiple relation types)
export const createMultiRelationSet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1' },
    { id: 2, rootId: 2, title: 'Relation 2' },
  ] as TestRelation[],

  profiles: [
    { id: 1, rootId: 1, bio: 'Profile 1', avatar: 'avatar1.jpg' },
    // Root 2 has no profile
  ] as TestProfile[],

  settings: [
    { id: 1, rootId: 1, theme: 'dark', notifications: true },
    { id: 2, rootId: 2, theme: 'light', notifications: false },
  ] as TestSettings[],
});

// Empty dataset for edge case testing
export const createEmptyDataSet = () => ({
  roots: [] as TestRoot[],
  relations: [] as TestRelation[],
});

// Single entity datasets for minimal tests
export const createSingleEntitySet = () => ({
  roots: [{ id: 1, name: 'Only Root' }] as TestRoot[],
  relations: [{ id: 1, rootId: 1, title: 'Only Relation' }] as TestRelation[],
});

// Combined root and relation filters dataset
export const createCombinedFiltersSet = () => ({
  projectRoots: [
    { id: 1, name: 'Project Alpha' }, // Matches name filter + has active relations
    { id: 2, name: 'Project Beta' }, // Matches name filter + has active relations
  ] as TestRoot[],

  allRoots: [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Project Beta' },
    { id: 3, name: 'Internal Tool' }, // Doesn't match name filter
    { id: 4, name: 'Project Gamma' }, // Matches name filter but no active relations
  ] as TestRoot[],

  activeRelations: [
    { id: 1, rootId: 1, title: 'Feature A', status: 'active' },
    { id: 2, rootId: 2, title: 'Feature B', status: 'active' },
  ] as (TestRelation & { status: string })[],

  allRelations: [
    { id: 1, rootId: 1, title: 'Feature A', status: 'active' },
    { id: 2, rootId: 2, title: 'Feature B', status: 'active' },
    { id: 3, rootId: 3, title: 'Internal Task', status: 'active' },
    { id: 4, rootId: 4, title: 'Old Feature', status: 'completed' },
  ] as (TestRelation & { status: string })[],
});

// Large dataset for integration testing with multiple relations per root
export const createLargeRootRelationSet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
    { id: 3, name: 'Root 3' },
    { id: 4, name: 'Root 4' },
    { id: 5, name: 'Root 5' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1' },
    { id: 2, rootId: 2, title: 'Relation 2' },
    { id: 3, rootId: 3, title: 'Relation 3' },
    { id: 4, rootId: 99, title: 'Relation with non-existent root' }, // Root 99 doesn't exist
  ] as TestRelation[],
});

// Multiple relations per root scenarios
export const createMultiRelationEntitySet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1A' },
    { id: 2, rootId: 1, title: 'Relation 1B' },
    { id: 3, rootId: 1, title: 'Relation 1C' },
    { id: 4, rootId: 2, title: 'Relation 2A' },
  ] as TestRelation[],
});

// Varying relation counts dataset
export const createVaryingRelationCountSet = () => ({
  roots: [
    { id: 1, name: 'Root with 3 relations' },
    { id: 2, name: 'Root with 1 relation' },
    { id: 3, name: 'Root with 0 relations' },
    { id: 4, name: 'Root with 2 relations' },
  ] as TestRoot[],

  relations: [
    // Root 1 has 3 relations
    { id: 1, rootId: 1, title: 'Relation 1A' },
    { id: 2, rootId: 1, title: 'Relation 1B' },
    { id: 3, rootId: 1, title: 'Relation 1C' },
    // Root 2 has 1 relation
    { id: 4, rootId: 2, title: 'Relation 2A' },
    // Root 3 has 0 relations
    // Root 4 has 2 relations
    { id: 5, rootId: 4, title: 'Relation 4A' },
    { id: 6, rootId: 4, title: 'Relation 4B' },
  ] as TestRelation[],
});

// Pagination page 2 dataset
export const createPaginationPage2Set = () => ({
  roots: [
    { id: 6, name: 'Root 6' }, // Page 2 roots
    { id: 7, name: 'Root 7' },
    { id: 8, name: 'Root 8' },
    { id: 9, name: 'Root 9' },
    { id: 10, name: 'Root 10' },
  ] as TestRoot[],

  relations: [
    { id: 11, rootId: 6, title: 'Relation 6A' },
    { id: 12, rootId: 6, title: 'Relation 6B' },
    { id: 13, rootId: 7, title: 'Relation 7A' },
    { id: 14, rootId: 8, title: 'Relation 8A' },
    { id: 15, rootId: 8, title: 'Relation 8B' },
    { id: 16, rootId: 8, title: 'Relation 8C' },
    // Root 9, 10 have no relations
  ] as TestRelation[],
});

// Complex multi-relationship dataset for integration tests
export const createComplexMultiRelationSet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
    { id: 3, name: 'Root 3' },
    { id: 4, name: 'Root 4' },
    { id: 5, name: 'Root 5' },
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'Relation 1A' },
    { id: 2, rootId: 1, title: 'Relation 1B' },
    { id: 3, rootId: 2, title: 'Relation 2A' },
    { id: 4, rootId: 4, title: 'Relation 4A' },
    { id: 5, rootId: 4, title: 'Relation 4B' },
    { id: 6, rootId: 4, title: 'Relation 4C' },
    // Root 3 and 5 have no relations
  ] as TestRelation[],

  settings: [
    { id: 1, rootId: 1, theme: 'dark', notifications: true },
    { id: 2, rootId: 1, theme: 'light', notifications: false },
    { id: 3, rootId: 3, theme: 'auto', notifications: true },
    { id: 4, rootId: 5, theme: 'dark', notifications: false },
    { id: 5, rootId: 5, theme: 'light', notifications: true },
    { id: 6, rootId: 5, theme: 'auto', notifications: false },
    // Root 2 and 4 have no settings
  ] as TestSettings[],
});

// Filtered root dataset
export const createFilteredRootSet = () => ({
  filteredRoots: [
    { id: 1, name: 'root-filter' },
    // { id: 2, name: 'other-root' }, // Filtered out
  ] as TestRoot[],

  relations: [
    { id: 1, rootId: 1, title: 'relation-1' },
    // { id: 2, rootId: 2, title: 'relation-2' }, // Not fetched - root 2 was filtered out
  ] as TestRelation[],
});

// Relation sort by title dataset for relation-driven sorting
export const createRelationSortByTitleSet = () => ({
  relationsByTitle: [
    { id: 1, rootId: 2, title: 'Alpha Task' },
    { id: 2, rootId: 1, title: 'Beta Task' },
    { id: 3, rootId: 3, title: 'Charlie Task' },
    { id: 4, rootId: 1, title: 'Delta Task' },
  ] as TestRelation[],

  rootsInRelationOrder: [
    { id: 2, name: 'Root 2' }, // Has "Alpha Task" (first)
    { id: 1, name: 'Root 1' }, // Has "Beta Task" (second)
    { id: 3, name: 'Root 3' }, // Has "Charlie Task" (third)
  ] as TestRoot[],

  rootsInNaturalOrder: [
    { id: 1, name: 'Root 1' }, // Natural ID order (NOT relation sort order)
    { id: 2, name: 'Root 2' },
    { id: 3, name: 'Root 3' },
  ] as TestRoot[],
});

// Relation sort by priority with multiple relations per root
export const createRelationSortByPrioritySet = () => ({
  relationsByPriority: [
    { id: 1, rootId: 1, title: 'Critical', priority: 10 },
    { id: 2, rootId: 1, title: 'High A', priority: 8 },
    { id: 3, rootId: 2, title: 'High B', priority: 7 },
    { id: 4, rootId: 3, title: 'Medium', priority: 5 },
    { id: 5, rootId: 2, title: 'Low', priority: 3 },
  ] as (TestRelation & { priority: number })[],

  uniqueRootsInOrder: [
    { id: 1, name: 'Root 1' }, // priority 10 (Critical)
    { id: 2, name: 'Root 2' }, // priority 7 (High B)
    { id: 3, name: 'Root 3' }, // priority 5 (Medium)
  ] as TestRoot[],
});

// Large relation sort dataset for pagination testing
export const createRelationSortPaginationSet = () => ({
  allRelationsSorted: [
    { id: 1, rootId: 5, title: 'Alpha' },
    { id: 2, rootId: 2, title: 'Bravo' },
    { id: 3, rootId: 8, title: 'Charlie' },
    { id: 4, rootId: 1, title: 'Delta' },
    { id: 5, rootId: 9, title: 'Echo' },
    { id: 6, rootId: 4, title: 'Foxtrot' },
    { id: 7, rootId: 7, title: 'Golf' },
    { id: 8, rootId: 3, title: 'Hotel' },
    { id: 9, rootId: 6, title: 'India' },
    { id: 10, rootId: 10, title: 'Juliet' },
  ] as TestRelation[],

  firstPageRoots: [
    { id: 5, name: 'Root 5' }, // Alpha
    { id: 2, name: 'Root 2' }, // Bravo
    { id: 8, name: 'Root 8' }, // Charlie
    { id: 1, name: 'Root 1' }, // Delta
    { id: 9, name: 'Root 9' }, // Echo
  ] as TestRoot[],

  secondPageRoots: [
    { id: 4, name: 'Root 4' }, // Foxtrot
    { id: 7, name: 'Root 7' }, // Golf
    { id: 3, name: 'Root 3' }, // Hotel
    { id: 6, name: 'Root 6' }, // India
    { id: 10, name: 'Root 10' }, // Juliet
  ] as TestRoot[],
});

// Empty relation sort result dataset
export const createRelationSortEmptySet = () => ({
  roots: [
    { id: 1, name: 'Root 1' },
    { id: 2, name: 'Root 2' },
    { id: 3, name: 'Root 3' },
  ] as TestRoot[],

  relations: [] as TestRelation[], // No relations match the sort filter
});
