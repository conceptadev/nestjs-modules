import { DynamicModule, Type } from '@nestjs/common';

import { OtpRepositoryInterface } from '../../../domain/repositories/otp-repository.interface';

export interface OtpExtrasInterface extends Pick<DynamicModule, 'global'> {
  repositories?: {
    otp?: Type<OtpRepositoryInterface>;
  };
}
