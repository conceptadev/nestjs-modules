import {
  PasswordStorageInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { PasswordCreationServiceInterface } from '@concepta/nestjs-password';

import { UserPasswordHistoryViolationException } from '../exceptions/user-password-history-violation.exception';

export class UserCredentialsCollection {
  constructor(
    readonly entries: (ReferenceIdInterface & PasswordStorageInterface)[],
    private readonly passwordCreationService: PasswordCreationServiceInterface,
  ) {}

  async notReused(password: string): Promise<void> {
    const isValid = await this.passwordCreationService.validateHistory({
      password,
      targets: this.entries,
    });

    if (!isValid) {
      throw new UserPasswordHistoryViolationException();
    }
  }
}
