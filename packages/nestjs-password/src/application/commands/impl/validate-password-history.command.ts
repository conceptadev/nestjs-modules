import { PasswordStorageInterface } from '@concepta/nestjs-common';

export class ValidatePasswordHistoryCommand {
  constructor(
    public readonly password: string,
    public readonly targets: PasswordStorageInterface[],
  ) {}
}
