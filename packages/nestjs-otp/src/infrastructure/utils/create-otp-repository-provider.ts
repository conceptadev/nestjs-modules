import { Provider } from '@nestjs/common';

import {
  OtpInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { OTP_MODULE_SETTINGS_TOKEN } from '../../otp.constants';
import { OtpSettingsInterface } from '../config/interfaces/otp-settings.interface';
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
    inject: [getDynamicRepositoryToken(entityKey), OTP_MODULE_SETTINGS_TOKEN],
    useFactory: (
      repository: RepositoryInterface<OtpInterface>,
      settings: OtpSettingsInterface,
    ) => {
      return new OtpRepository(repository, settings);
    },
  };
}
