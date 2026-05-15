import { Global, Module } from '@nestjs/common';

import { UserControllerFixtures } from './user.controller.fixture';

@Global()
@Module({
  controllers: [UserControllerFixtures],
})
export class UserModuleFixture {}
