import { HttpStatus } from '@nestjs/common';

import { RuntimeException } from '@concepta/rockets-app';

import { TokenException } from './token.exception';

export class TokenAlreadyRevokedException extends TokenException {
  context: RuntimeException['context'] & { tokenId: string };

  constructor(tokenId: string) {
    super({
      httpStatus: HttpStatus.CONFLICT,
      message: 'Token %s has already been revoked',
      messageParams: [tokenId],
    });
    this.errorCode = 'TOKEN_ALREADY_REVOKED_ERROR';
    this.context = { ...super.context, tokenId };
  }
}
