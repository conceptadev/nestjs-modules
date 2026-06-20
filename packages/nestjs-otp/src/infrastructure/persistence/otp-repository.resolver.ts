import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { OtpRepositoryResolverInterface } from '../../domain/repositories/otp-repository-resolver.interface';
import { OtpRepositoryInterface } from '../../domain/repositories/otp-repository.interface';
import { OtpEntityNotFoundException } from '../exceptions/otp-entity-not-found.exception';
import { getDynamicOtpRepositoryToken } from '../utils/create-otp-repository-provider';

@Injectable()
export class OtpRepositoryResolver implements OtpRepositoryResolverInterface {
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): OtpRepositoryInterface {
    const token = getDynamicOtpRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<OtpRepositoryInterface>(token, {
        strict: false,
      });
    } catch {
      throw new OtpEntityNotFoundException(entityKey);
    }
  }
}
