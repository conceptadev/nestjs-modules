import { AccessControl, IQueryInfo } from 'accesscontrol';

import { ExecutionContext } from '@nestjs/common';

import { ReferenceIdInterface } from '@concepta/nestjs-core';

interface ReferenceUserInterface<T = ReferenceIdInterface> {
  user: T;
}

export interface AccessControlContextArgsInterface extends ReferenceUserInterface<unknown> {
  request: unknown;
  query: IQueryInfo;
  accessControl: AccessControl;
  executionContext: ExecutionContext;
}
