import { OtpCreatableInterface } from '@concepta/nestjs-common';

export interface InvitationOtpSettingsInterface
  extends Pick<OtpCreatableInterface, 'type' | 'expiresIn'>,
    Partial<Pick<OtpCreatableInterface, 'rateSeconds' | 'rateThreshold'>> {
  namespace: string;
  clearOtpOnCreate?: boolean;
}
