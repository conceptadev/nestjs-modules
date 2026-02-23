import {
  OtpCoreAsyncOptions,
  OtpCoreOptions,
} from './otp-core.module-definition';

export type OtpOptions = Omit<OtpCoreOptions, 'global'>;
export type OtpAsyncOptions = Omit<OtpCoreAsyncOptions, 'global'>;
