import { registerAs } from '@nestjs/config';

import { FEDERATED_MODULE_DEFAULT_SETTINGS_TOKEN } from '../../federated.constants';

import { FederatedSettingsInterface } from './interfaces/federated-settings.interface';

export const federatedDefaultConfig = registerAs(
  FEDERATED_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): FederatedSettingsInterface => ({}),
);
