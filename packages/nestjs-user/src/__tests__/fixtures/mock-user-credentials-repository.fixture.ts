import { UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';

export function createMockUserCredentialsRepository(): jest.Mocked<UserCredentialsRepositoryInterface> {
  return {
    findActiveByUserId: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn(),
  };
}
