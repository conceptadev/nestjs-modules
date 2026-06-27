import { type AccessControl, type IQueryInfo } from 'accesscontrol';

import { type ExecutionContext } from '@nestjs/common';

import { type ReferenceUserInterface } from '@concepta/nestjs-common';

export interface AccessControlContextArgsInterface extends ReferenceUserInterface<unknown> {
  request: unknown;
  query: IQueryInfo;
  accessControl: AccessControl;
  executionContext: ExecutionContext;
}
