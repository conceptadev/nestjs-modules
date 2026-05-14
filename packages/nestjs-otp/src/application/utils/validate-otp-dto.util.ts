import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Type } from '@nestjs/common';

import { DeepPartial } from '@concepta/rockets-app';

import { OtpValidationException } from '../../domain/exceptions/otp-validation.exception';
import { OtpInterface } from '../../domain/interfaces/otp.interface';

export async function validateOtpDto<T extends DeepPartial<OtpInterface>>(
  type: Type<T>,
  data: T,
): Promise<T> {
  const dto = plainToInstance(type, data);
  const errors = await validate(dto);

  if (errors.length) {
    throw new OtpValidationException(type.name, errors);
  }

  return dto;
}
