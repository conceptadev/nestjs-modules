import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { PhotoEntityInterfaceFixture } from '../interfaces/photo-entity.interface.fixture';

@Exclude()
export class PhotoDtoFixture implements PhotoEntityInterfaceFixture {
  @ApiProperty()
  @Expose()
  @IsUUID()
  id: string = '';

  @ApiProperty()
  @Expose()
  @IsString()
  name = '';

  @ApiProperty()
  @Expose()
  @IsString()
  description = '';

  @ApiProperty()
  @Expose()
  @IsString()
  filename = '';

  @ApiProperty()
  @Expose()
  @IsNumber()
  views = 0;

  @ApiProperty()
  @Expose()
  @IsBoolean()
  isPublished = true;

  @ApiProperty({ nullable: true })
  @Expose()
  @IsDate()
  @IsOptional()
  deletedAt: Date | null = null;
}
