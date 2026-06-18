import { CanActivate, NestInterceptor } from '@nestjs/common';

import { AccessControlPortSettings } from '../../../application/ports/access-control.port';
import { AccessControlServiceInterface } from '../../../domain/ports/access-control-service.interface';

import { AccessControlSettingsInterface } from './access-control-settings.interface';

export interface AccessControlOptionsInterface {
  settings: AccessControlSettingsInterface;
  service?: AccessControlServiceInterface;
  appGuard?: CanActivate | false;
  appFilter?: NestInterceptor | false;
  ports?: {
    accessControl?: AccessControlPortSettings;
  };
}
