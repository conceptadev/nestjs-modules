import { Global, Module } from '@nestjs/common';

import { GuardsPolicy } from '../../../../../domain/policies/guards.policy';

import { UserControllerFixtures } from './user.controller.fixture';

@Global()
@Module({
  controllers: [UserControllerFixtures],
  providers: [{ provide: GuardsPolicy, useValue: new GuardsPolicy() }],
})
export class UserModuleFixture {}
