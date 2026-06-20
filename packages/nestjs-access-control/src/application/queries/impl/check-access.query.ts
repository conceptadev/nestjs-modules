import { ExecutionContext } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { CheckAccessQueryInterface } from '../../ports/access-control.port';

export class CheckAccessQuery
  extends Query<boolean>
  implements CheckAccessQueryInterface
{
  constructor(public readonly executionContext: ExecutionContext) {
    super();
  }
}
