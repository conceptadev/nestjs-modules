import {
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

import { PasswordHashObjectOptionsInterface } from './password-hash-object-options.interface';

/**
 * Password Storage Service Interface
 */
export interface PasswordStorageServiceInterface {
  /**
   * Hash a password using bcrypt.
   *
   * @param password - Password to be hashed
   */
  hash(password: string): Promise<PasswordStorageInterface>;

  /**
   * Hash password for an object.
   *
   * @param object - An object containing the new password to hash.
   * @param options - Hash object options
   * @returns A new object with the password hashed.
   */
  hashObject<T extends PasswordPlainInterface>(
    object: T,
    options?: PasswordHashObjectOptionsInterface,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;
}
