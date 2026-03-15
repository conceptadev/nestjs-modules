import { OtpRepositoryInterface } from './otp-repository.interface';

export interface OtpRepositoryResolverInterface {
  resolve(entityKey: string): OtpRepositoryInterface;
}
