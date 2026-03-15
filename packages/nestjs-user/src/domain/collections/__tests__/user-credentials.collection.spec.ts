import { PasswordCreationServiceInterface } from '@concepta/nestjs-password';

import { UserPasswordHistoryViolationException } from '../../exceptions/user-password-history-violation.exception';
import { UserCredentialsCollection } from '../user-credentials.collection';

describe(UserCredentialsCollection.name, () => {
  const entries = [
    { id: 'cred-1', passwordHash: 'hash1', passwordSalt: 'salt1' },
    { id: 'cred-2', passwordHash: 'hash2', passwordSalt: 'salt2' },
  ];

  const mockPasswordCreationService: jest.Mocked<
    Pick<PasswordCreationServiceInterface, 'validateHistory'>
  > = {
    validateHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notReused', () => {
    it('should resolve when password is not reused', async () => {
      mockPasswordCreationService.validateHistory.mockResolvedValue(true);

      const collection = new UserCredentialsCollection(
        entries,
        mockPasswordCreationService as unknown as PasswordCreationServiceInterface,
      );

      await expect(collection.notReused('new-pass')).resolves.toBeUndefined();
      expect(mockPasswordCreationService.validateHistory).toHaveBeenCalledWith({
        password: 'new-pass',
        targets: entries,
      });
    });

    it('should throw when password is reused', async () => {
      mockPasswordCreationService.validateHistory.mockResolvedValue(false);

      const collection = new UserCredentialsCollection(
        entries,
        mockPasswordCreationService as unknown as PasswordCreationServiceInterface,
      );

      await expect(collection.notReused('old-pass')).rejects.toThrow(
        UserPasswordHistoryViolationException,
      );
    });
  });
});
