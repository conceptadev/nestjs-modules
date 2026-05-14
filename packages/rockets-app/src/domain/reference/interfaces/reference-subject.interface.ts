import { ReferenceSubject } from './reference.types';

/**
 * Identifiable by subject (JWT).
 */
export interface ReferenceSubjectInterface<T = ReferenceSubject> {
  sub: T;
}
