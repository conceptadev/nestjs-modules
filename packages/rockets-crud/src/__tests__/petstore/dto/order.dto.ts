import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class Order {
  @ApiProperty({ type: 'integer', format: 'int64', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ type: 'integer', format: 'int64', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  petId?: number;

  @ApiProperty({ type: 'integer', format: 'int32', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  @Expose()
  @IsOptional()
  @IsDate()
  shipDate?: Date;

  @ApiProperty({
    enum: ['placed', 'approved', 'delivered'],
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsEnum(['placed', 'approved', 'delivered'])
  status?: 'placed' | 'approved' | 'delivered';

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsBoolean()
  complete?: boolean;
}
