import { Global, Module } from '@nestjs/common';
import { CqrsModule, QueryHandler } from '@nestjs/cqrs';

import { AUTHENTICATION_USER_PORT_TOKEN } from '../../authentication.constants';

import {
  createMockUserPortProvider,
  MockGetUserByIdHandler,
  MockGetUserByEmailHandler,
  MockGetUserByUsernameHandler,
  MockGetUserBySubjectQuery,
  MockUpdateUserHandler,
} from './ports/mock-user-port.provider';

export const FIXTURE_USER = {
  id: 'fixture-user-id',
  active: true,
};

@QueryHandler(MockGetUserBySubjectQuery)
class GetUserBySubjectHandler {
  async execute() {
    return FIXTURE_USER;
  }
}

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    createMockUserPortProvider(),
    MockGetUserByIdHandler,
    GetUserBySubjectHandler,
    MockGetUserByUsernameHandler,
    MockGetUserByEmailHandler,
    MockUpdateUserHandler,
  ],
  exports: [AUTHENTICATION_USER_PORT_TOKEN],
})
export class UserModuleFixture {}
