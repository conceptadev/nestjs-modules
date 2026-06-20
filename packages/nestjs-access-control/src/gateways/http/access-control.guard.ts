import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { ACCESS_CONTROL_PORT_TOKEN } from '../../access-control.constants';
import { AccessControlPort } from '../../application/ports/access-control.port';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_CONTROL_PORT_TOKEN)
    private readonly accessControlPort: AccessControlPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.accessControlPort.checkAccess(context);
  }
}
