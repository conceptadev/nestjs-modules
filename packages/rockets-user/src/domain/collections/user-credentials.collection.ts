import { ReferenceIdInterface } from '@concepta/rockets-app';
import { PasswordStorageInterface } from '@concepta/rockets-password';

import { UserPasswordHistoryViolationException } from '../exceptions/user-password-history-violation.exception';
import { UserPasswordPort } from '../ports/user-password.port';

export class UserCredentialsCollection {
  constructor(
    readonly entries: (ReferenceIdInterface & PasswordStorageInterface)[],
    private readonly passwordPort: UserPasswordPort,
  ) {}

  async notReused(password: string): Promise<void> {
    const isValid = await this.passwordPort.validateHistory(
      password,
      this.entries,
    );

    if (!isValid) {
      throw new UserPasswordHistoryViolationException();
    }
  }
}
