import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { type Type } from '@nestjs/common';

import { type DeepPartial } from '@concepta/nestjs-core';

import { OtpValidationException } from '../../domain/exceptions/otp-validation.exception';
import { type OtpInterface } from '../../domain/interfaces/otp.interface';

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
