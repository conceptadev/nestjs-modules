import {
  AuditInterface,
  CacheInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

export interface CacheEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    CacheInterface,
    AuditInterface {}
