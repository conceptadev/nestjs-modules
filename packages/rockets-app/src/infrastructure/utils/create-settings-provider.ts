import { InjectionToken, Provider } from '@nestjs/common';

import { ModuleOptionsSettingsInterface } from '../config/interfaces/module-options-settings.interface';

export function createSettingsProvider<
  ModuleSettingsType,
  ModuleOptionsType extends ModuleOptionsSettingsInterface<ModuleSettingsType>,
>(options: {
  settingsKey: string | symbol;
  settingsToken: string;
  optionsToken: InjectionToken;
  optionsOverrides?: ModuleOptionsType;
}): Provider {
  const { optionsOverrides, settingsToken, optionsToken, settingsKey } =
    options;

  return {
    provide: settingsToken,
    inject: [optionsToken, settingsKey],
    useFactory: async (
      moduleOptions: ModuleOptionsType,
      defaultSettings: ModuleSettingsType,
    ) => {
      const effectiveSettings =
        optionsOverrides?.settings ?? moduleOptions?.settings;

      if (optionsOverrides?.settingsTransform) {
        return optionsOverrides.settingsTransform(
          effectiveSettings,
          defaultSettings,
        );
      } else {
        return effectiveSettings ?? defaultSettings;
      }
    },
  };
}
