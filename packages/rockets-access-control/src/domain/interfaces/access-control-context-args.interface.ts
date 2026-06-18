import { AccessControl, IQueryInfo } from 'accesscontrol';

import { ExecutionContext } from '@nestjs/common';

import { ReferenceUserInterface } from '@concepta/nestjs-common';

export interface AccessControlContextArgsInterface
  extends ReferenceUserInterface<unknown> {
  request: unknown;
  query: IQueryInfo;
  accessControl: AccessControl;
  executionContext: ExecutionContext;
}
