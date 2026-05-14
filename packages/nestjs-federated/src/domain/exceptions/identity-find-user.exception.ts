import { HttpStatus } from '@nestjs/common';

import {
  ReferenceIdInterface,
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

import { FederatedException } from './federated.exception';

export class IdentityFindUserException extends FederatedException {
  context: RuntimeException['context'] & {
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
      ...super.context,
      entityName,
      user,
    };
  }
}
