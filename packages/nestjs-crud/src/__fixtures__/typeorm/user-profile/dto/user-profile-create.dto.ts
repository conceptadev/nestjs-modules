import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class UserProfileCreateDto {
  @Expose()
  @IsNumber()
  userId!: number;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  favoriteColor?: string;
}
