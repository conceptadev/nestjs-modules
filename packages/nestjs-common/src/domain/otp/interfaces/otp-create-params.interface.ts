import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpParamsInterface } from './otp-params.interface';

export interface OtpCreateParamsInterface
  extends Pick<OtpParamsInterface, 'assignment' | 'otp'>,
    Partial<Pick<OtpCreatableInterface, 'rateSeconds' | 'rateThreshold'>> {
  duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';
}
