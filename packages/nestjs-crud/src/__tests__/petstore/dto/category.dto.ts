import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class Category {
  @ApiProperty({ type: 'integer', format: 'int64', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;
}
