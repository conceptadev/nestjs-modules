import { AccessControl, IQueryInfo } from 'accesscontrol';

import { ExecutionContext } from '@nestjs/common';

export interface AccessControlContextInterface {
  getRequest(property?: string): unknown;
  getUser(): unknown;
  getQuery(): IQueryInfo;
  getAccessControl(): AccessControl;
  getExecutionContext(): ExecutionContext;
}
