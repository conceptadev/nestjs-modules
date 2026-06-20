import { Expose } from 'class-transformer';

export class UserProfileDto {
  @Expose()
  id?: number;

  @Expose()
  userId!: number;

  @Expose()
  nickName?: string;

  @Expose()
  favoriteColor?: string;
}
