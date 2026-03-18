import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { OtpRepositoryInterface } from '../../domain/repositories/otp-repository.interface';
import { OTP_CUSTOM_REPOSITORY_TOKEN } from '../../otp.constants';
import { OtpEntityInterface } from '../persistence/interfaces/otp-entity.interface';
import { OtpMapper } from '../persistence/otp.mapper';
import { OtpRepository } from '../persistence/otp.repository';

/**
 * Generates a dynamic repository token for a given OTP entity key.
 *
 * @param entityKey - Entity key to generate the repository token for (e.g., 'confirm-email')
 */
export function getDynamicOtpRepositoryToken(entityKey: string): string {
  return `OTP_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createOtpRepositoryProvider(entityKey: string): Provider {
  return {
    provide: getDynamicOtpRepositoryToken(entityKey),
    inject: [
      getDynamicRepositoryToken(entityKey),
      OtpMapper,
      { token: OTP_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<OtpEntityInterface>,
      mapper: OtpMapper,
      customRepo?: Type<OtpRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? OtpRepository;
      return new RepoClass(repository, mapper);
    },
  };
}
