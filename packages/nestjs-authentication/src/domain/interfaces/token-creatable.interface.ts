import { TokenType } from './token.interface';

export interface TokenCreatableInterface {
  sub: string;
  type: TokenType;
  scope?: string[];
  iat?: Date;
  exp: Date;
}
