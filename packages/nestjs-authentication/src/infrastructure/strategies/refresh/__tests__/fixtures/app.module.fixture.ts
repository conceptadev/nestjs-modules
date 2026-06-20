import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UserModuleFixture } from '../../../../../__tests__/fixtures/user.module.fixture';
import { AuthenticationModule } from '../../../../../authentication.module';

import { RefreshControllerFixture } from './refresh.controller.fixture';

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
          refresh: {},
        },
      },
    }),
  ],
  controllers: [RefreshControllerFixture],
  exports: [CqrsModule],
})
export class AppModuleFixture {}
