import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Token configuration options (excludes secretOrPrivateKey).
 */
export interface TokenOptionsInterface extends Omit<
  JwtModuleOptions,
  'secretOrPrivateKey' | 'secret'
> {
  /**
   * Narrowed from jwt.Secret → string | Buffer.
   * KeyObject is not supported for per-call sign/verify options.
   */
  secret?: string | Buffer;
}
