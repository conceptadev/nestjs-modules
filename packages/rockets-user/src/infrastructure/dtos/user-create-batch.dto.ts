import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '@concepta/rockets-crud';

import { UserCreatableInterface } from '../../domain/interfaces/user-creatable.interface';

import { UserCreateDto } from './user-create.dto';

@Exclude()
export class UserCreateBatchDto extends CrudCreateBatchDto<UserCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: UserCreateDto,
    isArray: true,
    description: 'Array of Users to create',
  })
  @Type(() => UserCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: UserCreateDto[] = [];
}
