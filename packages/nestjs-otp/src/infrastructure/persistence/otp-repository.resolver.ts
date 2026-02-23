import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { OtpEntityNotFoundException } from '../exceptions/otp-entity-not-found.exception';
import { getDynamicOtpRepositoryToken } from '../utils/create-otp-repository-provider';

import { OtpRepository } from './otp.repository';

@Injectable()
export class OtpRepositoryResolver {
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): OtpRepository {
    const token = getDynamicOtpRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<OtpRepository>(token, { strict: false });
    } catch {
      throw new OtpEntityNotFoundException(entityKey);
    }
  }
}
