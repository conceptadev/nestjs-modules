import { DynamicModule, Provider, Type } from '@nestjs/common';

import { OtpRepositoryInterface } from '../../../domain/repositories/otp-repository.interface';

export interface OtpExtrasInterface extends Pick<DynamicModule, 'global'> {
  providers?: Provider[];
  repositories?: {
    otp?: Type<OtpRepositoryInterface>;
  };
}
