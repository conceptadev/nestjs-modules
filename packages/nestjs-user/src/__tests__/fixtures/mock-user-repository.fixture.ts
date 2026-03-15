import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';

export function createMockUserRepository(): jest.Mocked<UserRepositoryInterface> {
  return {
    get: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}
