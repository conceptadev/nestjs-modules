import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { OtpCreatableInterface } from '../../domain/interfaces/otp-creatable.interface';

/**
 * Otp Create DTO
 */
@Exclude()
export class OtpCreateDto implements OtpCreatableInterface {
  /**
   * category
   */
  @Expose()
  @IsString()
  category = '';

  /**
   * type
   */
  @Expose()
  @IsString()
  type = '';

  /**
   * Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
   *
   * Eg: 60, "2 days", "10h", "7d"
   */
  @Expose()
  @IsString()
  expiresIn = '';

  /**
   * The minimum number of seconds that must pass between OTP generation requests.
   * This helps prevent abuse by rate limiting how frequently new OTPs can be created.
   */
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  rateSeconds?: number;

  /**
   * How many attempts before the user is blocked within the rateSeconds time window.
   * For example, if rateSeconds is 60 and rateThreshold is 3, the user will be blocked
   * after 3 failed attempts within 60 seconds.
   */
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(1)
  rateThreshold?: number;

  /**
   * Assignee
   */
  @Expose()
  @IsString()
  assigneeId!: string;
}
