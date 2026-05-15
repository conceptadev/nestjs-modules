import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationModule } from '../../../../../authentication.module';

import { UserModuleFixture } from './user.module.fixture';

@Module({
  imports: [
    CqrsModule,
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
          local: {},
          refresh: {},
        },
      },
    }),
    UserModuleFixture,
  ],
  exports: [CqrsModule],
})
export class AppModuleFixture {}
