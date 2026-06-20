import { PlainLiteralObject } from '@nestjs/common';

import { SpecificationInterface } from '../interfaces/specification.interface';

import { AlwaysSpecification } from './specifications/always.specification';
import { AndSpecification } from './specifications/and.specification';
import { NeverSpecification } from './specifications/never.specification';
import { NotSpecification } from './specifications/not.specification';
import { OrSpecification } from './specifications/or.specification';

/**
 * Factory for creating common specifications.
 *
 * Provides a fluent API for creating and composing specifications.
 *
 * @example
 * ```typescript
 * // Simple specifications
 * Spec.always()
 * Spec.never()
 *
 * // Composed specifications
 * Spec.and(spec1, spec2)
 * Spec.or(spec1, spec2)
 * Spec.not(spec1)
 *
 * // Nested composition
 * Spec.and(Spec.or(spec1, spec2), Spec.not(spec3))
 * ```
 */
export const Spec = {
  /**
   * Always matches - hook always applies.
   */
  always: <
    Ctx extends PlainLiteralObject = PlainLiteralObject,
  >(): SpecificationInterface<Ctx> => new AlwaysSpecification<Ctx>(),

  /**
   * Never matches - hook never applies.
   * Useful for temporarily disabling hooks.
   */
  never: <
    Ctx extends PlainLiteralObject = PlainLiteralObject,
  >(): SpecificationInterface<Ctx> => new NeverSpecification<Ctx>(),

  /**
   * Combine two specifications with AND logic.
   * Both specifications must be satisfied for the result to be true.
   */
  and: <Ctx extends PlainLiteralObject = PlainLiteralObject>(
    left: SpecificationInterface<Ctx>,
    right: SpecificationInterface<Ctx>,
  ): SpecificationInterface<Ctx> => new AndSpecification(left, right),

  /**
   * Combine two specifications with OR logic.
   * Either specification being satisfied will make the result true.
   */
  or: <Ctx extends PlainLiteralObject = PlainLiteralObject>(
    left: SpecificationInterface<Ctx>,
    right: SpecificationInterface<Ctx>,
  ): SpecificationInterface<Ctx> => new OrSpecification(left, right),

  /**
   * Negate a specification.
   * The result is true when the wrapped specification is not satisfied.
   */
  not: <Ctx extends PlainLiteralObject = PlainLiteralObject>(
    spec: SpecificationInterface<Ctx>,
  ): SpecificationInterface<Ctx> => new NotSpecification(spec),
};
