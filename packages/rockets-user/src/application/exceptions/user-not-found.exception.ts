import { HttpStatus } from '@nestjs/common';

import { RuntimeException } from '@concepta/rockets-app';

import { UserException } from '../../domain/exceptions/user.exception';

export class UserNotFoundException extends UserException {
  context: RuntimeException['context'] & {
    id: string;
  };

  constructor(options: { id: string; message?: string }) {
    const { id, message = 'User not found for id=%s' } = options;

    super({
      httpStatus: HttpStatus.NOT_FOUND,
      message,
      messageParams: [id],
    });

    this.errorCode = 'USER_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      id,
    };
  }
}
