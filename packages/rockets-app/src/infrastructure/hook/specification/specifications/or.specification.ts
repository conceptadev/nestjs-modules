import { PlainLiteralObject } from '@nestjs/common';

import { SpecificationInterface } from '../../interfaces/specification.interface';
import { CompositeSpecification } from '../composite-specification';

/**
 * Combines two specifications with OR logic.
 * Either specification being satisfied will make the result true.
 */
export class OrSpecification<
  Ctx extends PlainLiteralObject = PlainLiteralObject,
> extends CompositeSpecification<Ctx> {
  constructor(
    private readonly left: SpecificationInterface<Ctx>,
    private readonly right: SpecificationInterface<Ctx>,
  ) {
    super();
  }

  isSatisfiedBy(context: Ctx): boolean {
    return (
      this.left.isSatisfiedBy(context) || this.right.isSatisfiedBy(context)
    );
  }
}
