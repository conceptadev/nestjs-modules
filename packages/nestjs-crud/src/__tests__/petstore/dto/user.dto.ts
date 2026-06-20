import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class User {
  @ApiProperty({ type: 'integer', format: 'int64', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: 'integer', format: 'int32', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  userStatus?: number;
}
