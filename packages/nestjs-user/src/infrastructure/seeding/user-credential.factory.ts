import { UserCredentialEntityInterface } from '@concepta/nestjs-common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { Factory } from '@concepta/typeorm-seeding';

/**
 * User credential factory
 *
 * WARNING: Development-only factory. Never use in production seeding.
 */
export class UserCredentialFactory extends Factory<UserCredentialEntityInterface> {
  private static readonly DEV_SEED_PASSWORD =
    process.env.USER_SEED_PASSWORD ?? 'Test1233';

  private _passwordStorageService = new PasswordStorageService();

  /**
   * Factory callback function.
   */
  protected async entity(
    userCredentials: UserCredentialEntityInterface,
  ): Promise<UserCredentialEntityInterface> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('UserCredentialFactory must not be used in production');
    }

    const passwordStore = await this._passwordStorageService.hash(
      UserCredentialFactory.DEV_SEED_PASSWORD,
    );

    // TypeORM requires entity class instances (not plain objects)
    userCredentials.passwordHash = passwordStore.passwordHash;
    userCredentials.passwordSalt = passwordStore.passwordSalt;

    return userCredentials;
  }
}
