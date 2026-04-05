import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { CacheInterface } from '../../../domain/interfaces/cache.interface';

export interface CacheEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    CacheInterface,
    AuditInterface {}
