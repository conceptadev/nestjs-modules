import { OtpContextInterface } from './otp-context.interface';

export interface WithOtpContextInterface {
  withOtp(): OtpContextInterface;
}
