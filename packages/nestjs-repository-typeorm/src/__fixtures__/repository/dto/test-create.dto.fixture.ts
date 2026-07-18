import { IsOptional, IsString, MinLength } from 'class-validator';

import { TestCreatableInterfaceFixture } from '../interface/test-creatable.interface.fixture.js';

export class TestCreateDtoFixture implements TestCreatableInterfaceFixture {
  @IsString()
  @MinLength(2)
  firstName = '';

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;
}
