import { UserCredentialsService } from '../../domain/services/user-credentials.service';

export function createMockUserCredentialsService(): jest.Mocked<UserCredentialsService> {
  return {
    setPassword: jest.fn(),
    updatePassword: jest.fn(),
  } as unknown as jest.Mocked<UserCredentialsService>;
}
