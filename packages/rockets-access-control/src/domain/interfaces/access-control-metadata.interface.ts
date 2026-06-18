import { Type } from '@nestjs/common';

import { AccessControlServiceInterface } from '../ports/access-control-service.interface';

export interface AccessControlMetadataInterface {
  service?: Type<AccessControlServiceInterface>;
}
