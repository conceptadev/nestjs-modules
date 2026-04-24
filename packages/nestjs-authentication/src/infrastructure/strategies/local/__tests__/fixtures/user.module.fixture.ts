import { Global, Module } from '@nestjs/common';
import { CqrsModule, QueryHandler } from '@nestjs/cqrs';

import {
  createMockPasswordPortProvider,
  mockPasswordPortHandlers,
} from '../../../../../__tests__/fixtures/ports/mock-password-port.provider';
import {
  createMockUserPortProvider,
  MockGetUserByIdHandler,
  MockGetUserByEmailHandler,
  MockGetUserBySubjectQuery,
  MockGetUserByUsernameQuery,
  MockUpdateUserHandler,
} from '../../../../../__tests__/fixtures/ports/mock-user-port.provider';
import {
  AUTHENTICATION_PASSWORD_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
} from '../../../../../authentication.constants';

import { USER_SUCCESS } from './constants';

@QueryHandler(MockGetUserByUsernameQuery)
class GetUserByUsernameHandler {
  async execute(query: MockGetUserByUsernameQuery) {
    return query.username === USER_SUCCESS.username ? USER_SUCCESS : null;
  }
}

@QueryHandler(MockGetUserBySubjectQuery)
class GetUserBySubjectHandler {
  async execute() {
    return USER_SUCCESS;
  }
}

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    createMockUserPortProvider(),
    createMockPasswordPortProvider(),
    // user port handlers (override username + subject lookups)
    MockGetUserByIdHandler,
    GetUserByUsernameHandler,
    GetUserBySubjectHandler,
    MockGetUserByEmailHandler,
    MockUpdateUserHandler,
    // password port handlers
    ...mockPasswordPortHandlers,
  ],
  exports: [AUTHENTICATION_USER_PORT_TOKEN, AUTHENTICATION_PASSWORD_PORT_TOKEN],
})
export class UserModuleFixture {}
