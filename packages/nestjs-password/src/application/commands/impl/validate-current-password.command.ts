import { PasswordStorageInterface } from '@concepta/nestjs-common';

export class ValidateCurrentPasswordCommand {
  constructor(
    public readonly password: string,
    public readonly target: PasswordStorageInterface,
  ) {}
}
