import { Expose, Type } from 'class-transformer';

import { CompanyDto } from '../../company/dto/company.dto';
import { UserProfileDto } from '../../user-profile/dto/user-profile.dto';

export class UserDto {
  @Expose()
  id?: number;

  @Expose()
  email!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  companyId?: number;

  @Expose()
  deletedAt?: Date;

  @Expose()
  firstName?: string | null;

  @Expose()
  lastName?: string | null;

  @Expose()
  @Type(() => CompanyDto)
  company?: CompanyDto;

  @Expose()
  @Type(() => UserProfileDto)
  userProfile?: UserProfileDto;
}
