import { type Type } from '@nestjs/common';

export interface LocalStrategyPolicySettingsInterface {
  loginDto?: Type;
  usernameField?: string;
  passwordField?: string;
}

export class LocalStrategyPolicy {
  readonly loginDto: Type | undefined;
  readonly usernameField: string;
  readonly passwordField: string;

  constructor(settings: LocalStrategyPolicySettingsInterface) {
    const {
      loginDto,
      usernameField = 'username',
      passwordField = 'password',
    } = settings;

    this.loginDto = loginDto;
    this.usernameField = usernameField;
    this.passwordField = passwordField;
  }
}
