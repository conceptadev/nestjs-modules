import { HttpStatus } from '@nestjs/common';

import {
  type ReferenceIdInterface,
  type RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

import { FederatedException } from './federated.exception';

export class IdentityFindUserException extends FederatedException {
  declare context: RuntimeException['context'] & {
    entityName: string;
    user: ReferenceIdInterface;
  };

  constructor(
    entityName: string,
    user: ReferenceIdInterface,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Error while trying to find user %s',
      messageParams: [user.id],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'FEDERATED_IDENTITY_FIND_USER_ERROR';

    this.context = {
      ...this.context,
      entityName,
      user,
    };
  }
}
