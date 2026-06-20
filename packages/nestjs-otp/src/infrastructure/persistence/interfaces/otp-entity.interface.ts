import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export interface OtpEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    OtpInterface,
    AuditInterface {}
