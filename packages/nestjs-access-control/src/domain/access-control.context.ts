import { AccessControl, IQueryInfo } from 'accesscontrol';

import { ExecutionContext } from '@nestjs/common';

import { AccessControlContextArgsInterface } from './interfaces/access-control-context-args.interface';
import { AccessControlContextInterface } from './interfaces/access-control-context.interface';

export class AccessControlContext implements AccessControlContextInterface {
  constructor(private readonly ctxArgs: AccessControlContextArgsInterface) {}

  protected hasProp<K extends string>(
    obj: unknown,
    key: K,
  ): obj is Record<K, unknown> {
    return (
      key !== null && obj !== null && typeof obj === 'object' && key in obj
    );
  }

  protected getProp(obj: unknown, prop: string) {
    return this.hasProp(obj, prop) ? obj[prop] : undefined;
  }

  getRequest(property?: string): unknown {
    return property?.length
      ? this.getProp(this.ctxArgs.request, property)
      : this.ctxArgs.request;
  }

  getUser(): unknown {
    return this.ctxArgs.user;
  }

  getQuery(): IQueryInfo {
    return this.ctxArgs.query;
  }

  getAccessControl(): AccessControl {
    return this.ctxArgs.accessControl;
  }

  getExecutionContext(): ExecutionContext {
    return this.ctxArgs.executionContext;
  }
}
