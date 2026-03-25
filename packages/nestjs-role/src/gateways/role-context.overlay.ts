import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ContextOverlayInterface } from '@concepta/nestjs-common';

import {
  ROLE_NAMESPACE_KEY,
  RoleNamespaceOptions,
} from './decorators/role-namespace.decorator';
import { RoleContextInterface } from './interfaces/role-context.interface';

@Injectable()
export class RoleContextOverlay
  implements ContextOverlayInterface<'withRole', RoleContextInterface>
{
  readonly name = 'withRole';

  constructor(private readonly reflector: Reflector) {}

  resolve(context: ExecutionContext): RoleContextInterface {
    const options = this.reflector.getAllAndOverride<RoleNamespaceOptions>(
      ROLE_NAMESPACE_KEY,
      [context.getHandler(), context.getClass()],
    );
    return { namespace: options?.name ?? '' };
  }
}
