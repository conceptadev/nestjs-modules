import {
  type AuditInterface,
  type ReferenceIdInterface,
  type ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { type CacheInterface } from '../../../domain/interfaces/cache.interface';

export interface CacheEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    CacheInterface,
    AuditInterface {}
