import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { CrudInvalidMutationDto } from './crud-invalid-mutation.dto';
import { CrudCreateBatchInterface } from './interfaces/crud-create-batch.interface';

@Exclude()
export class CrudCreateBatchDto<T> implements CrudCreateBatchInterface<T> {
  @Expose()
  @ApiProperty({ type: CrudInvalidMutationDto, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CrudInvalidMutationDto)
  bulk: T[] = [];
}
