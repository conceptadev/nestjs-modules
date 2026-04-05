import { HttpStatus } from '@nestjs/common';

import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

import { FederatedException } from './federated.exception';

export class IdentityUserRelationshipException extends FederatedException {
  context: RuntimeException['context'] & {
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
      ...super.context,
      identityId,
    };
  }
}
