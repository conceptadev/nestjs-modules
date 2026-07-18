import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UserModuleFixture } from '../../../../../__tests__/fixtures/user.module.fixture.js';
import { AuthenticationModule } from '../../../../../authentication.module.js';

import { UserControllerFixtures } from './user.controller.fixture.js';

@Module({
  imports: [
    CqrsModule,
    UserModuleFixture,
    AuthenticationModule.forRoot({
      appGuard: false,
      settings: {
        jwt: {
          access: {
            secret: 'test-access-secret',
            signOptions: { expiresIn: '1h' },
          },
          refresh: {
            secret: 'test-refresh-secret',
            signOptions: { expiresIn: '7d' },
          },
        },
        strategies: {
          jwt: {},
        },
      },
    }),
  ],
  controllers: [UserControllerFixtures],
  exports: [CqrsModule],
})
export class AppModuleFixture {}
