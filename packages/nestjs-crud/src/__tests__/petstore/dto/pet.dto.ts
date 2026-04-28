import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Category } from './category.dto';
import { Tag } from './tag.dto';

@Exclude()
export class Pet {
  @ApiProperty({ type: 'integer', format: 'int64', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty()
  @Expose()
  @IsString()
  name: string = '';

  @ApiProperty({ type: () => Category, required: false })
  @Expose()
  @Type(() => Category)
  @IsOptional()
  @ValidateNested()
  category?: Category;

  @ApiProperty({ type: [String] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  photoUrls: string[] = [];

  @ApiProperty({ type: () => Tag, isArray: true, required: false })
  @Expose()
  @Type(() => Tag)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  tags?: Tag[];

  @ApiProperty({
    enum: ['available', 'pending', 'sold'],
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsEnum(['available', 'pending', 'sold'])
  status?: 'available' | 'pending' | 'sold';
}
