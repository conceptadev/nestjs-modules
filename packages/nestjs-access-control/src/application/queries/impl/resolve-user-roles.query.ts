import { ExecutionContext } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ResolveUserRolesQueryInterface } from '../../ports/access-control.port';

export class ResolveUserRolesQuery
  extends Query<string | string[]>
  implements ResolveUserRolesQueryInterface
{
  constructor(public readonly executionContext: ExecutionContext) {
    super();
  }
}
