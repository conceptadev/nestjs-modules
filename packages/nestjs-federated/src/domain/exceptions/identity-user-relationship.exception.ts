import { HttpStatus } from '@nestjs/common';

import {
  type RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

import { FederatedException } from './federated.exception.js';

export class IdentityUserRelationshipException extends FederatedException {
  declare context: RuntimeException['context'] & {
    identityId: string;
  };

  constructor(identityId: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to load user relationship from identity %s',
      messageParams: [identityId],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'FEDERATED_IDENTITY_USER_RELATIONSHIP_ERROR';

    this.context = {
      ...this.context,
      identityId,
    };
  }
}
