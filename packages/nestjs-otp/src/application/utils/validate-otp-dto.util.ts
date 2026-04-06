import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Type } from '@nestjs/common';

import { DeepPartial, ModelValidationException } from '@concepta/nestjs-common';

import { OtpInterface } from '../../domain/interfaces/otp.interface';

export async function validateOtpDto<T extends DeepPartial<OtpInterface>>(
  type: Type<T>,
  data: T,
): Promise<T> {
  const dto = plainToInstance(type, data);
  const errors = await validate(dto);

  if (errors.length) {
    throw new ModelValidationException(type.name, errors);
  }

  return dto;
}
