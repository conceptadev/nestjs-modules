import { ExecutionContext } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { FilterResponseAttributesQueryInterface } from '../../ports/access-control.port';

export class FilterResponseAttributesQuery
  extends Query<unknown>
  implements FilterResponseAttributesQueryInterface
{
  constructor(
    public readonly executionContext: ExecutionContext,
    public readonly data: unknown,
  ) {
    super();
  }
}
