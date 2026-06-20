import { IsOptional, IsString, MinLength } from 'class-validator';

import { TestUpdatableInterfaceFixture } from '../interface/test-updatable.interface.fixture';

export class TestUpdateDtoFixture implements TestUpdatableInterfaceFixture {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;
}
