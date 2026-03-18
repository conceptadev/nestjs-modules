import {
  AuditInterface,
  OtpInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

export interface OtpEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    OtpInterface,
    AuditInterface {}
