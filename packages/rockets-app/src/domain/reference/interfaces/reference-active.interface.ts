import { ReferenceActive } from './reference.types';

/**
 * Identifiable by active.
 */
export interface ReferenceActiveInterface<T = ReferenceActive> {
  active: T;
}
