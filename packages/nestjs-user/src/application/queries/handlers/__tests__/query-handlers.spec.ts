import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import {
  createMockUserEntity,
  createMockUserRepository,
  toUserDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { UserRepositoryInterface } from '../../../../domain/repositories/user-repository.interface';
import { GetUserByEmailQuery } from '../../impl/get-user-by-email.query';
import { GetUserBySubjectQuery } from '../../impl/get-user-by-subject.query';
import { GetUserByUsernameQuery } from '../../impl/get-user-by-username.query';
import { GetUserQuery } from '../../impl/get-user.query';
import { GetUserByEmailHandler } from '../get-user-by-email.handler';
import { GetUserBySubjectHandler } from '../get-user-by-subject.handler';
import { GetUserByUsernameHandler } from '../get-user-by-username.handler';
import { GetUserHandler } from '../get-user.handler';

const ctx = {} as RepositoryContextInterface;
const mockUser = toUserDomain(createMockUserEntity());

describe(GetUserHandler.name, () => {
  let handler: GetUserHandler;
  let repo: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    repo = createMockUserRepository();
    handler = new GetUserHandler(repo);
  });

  it('should return user when found', async () => {
    repo.get.mockResolvedValue(mockUser);
    const result = await handler.execute(new GetUserQuery(ctx, 'user-1'));
    expect(result).toBe(mockUser);
    expect(repo.get).toHaveBeenCalledWith(ctx, 'user-1');
  });

  it('should return null when not found', async () => {
    repo.get.mockResolvedValue(null);
    const result = await handler.execute(new GetUserQuery(ctx, 'missing'));
    expect(result).toBeNull();
  });
});

describe(GetUserByEmailHandler.name, () => {
  let handler: GetUserByEmailHandler;
  let repo: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    repo = createMockUserRepository();
    handler = new GetUserByEmailHandler(repo);
  });

  it('should return user when found', async () => {
    repo.findByEmail.mockResolvedValue(mockUser);
    const result = await handler.execute(
      new GetUserByEmailQuery(ctx, 'a@b.com'),
    );
    expect(result).toBe(mockUser);
    expect(repo.findByEmail).toHaveBeenCalledWith(ctx, 'a@b.com');
  });

  it('should return null when not found', async () => {
    repo.findByEmail.mockResolvedValue(null);
    const result = await handler.execute(
      new GetUserByEmailQuery(ctx, 'missing@b.com'),
    );
    expect(result).toBeNull();
  });
});

describe(GetUserByUsernameHandler.name, () => {
  let handler: GetUserByUsernameHandler;
  let repo: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    repo = createMockUserRepository();
    handler = new GetUserByUsernameHandler(repo);
  });

  it('should return user when found', async () => {
    repo.findByUsername.mockResolvedValue(mockUser);
    const result = await handler.execute(
      new GetUserByUsernameQuery(ctx, 'john'),
    );
    expect(result).toBe(mockUser);
    expect(repo.findByUsername).toHaveBeenCalledWith(ctx, 'john');
  });

  it('should return null when not found', async () => {
    repo.findByUsername.mockResolvedValue(null);
    const result = await handler.execute(
      new GetUserByUsernameQuery(ctx, 'missing'),
    );
    expect(result).toBeNull();
  });
});

describe(GetUserBySubjectHandler.name, () => {
  let handler: GetUserBySubjectHandler;
  let repo: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    repo = createMockUserRepository();
    handler = new GetUserBySubjectHandler(repo);
  });

  it('should return user when found', async () => {
    repo.get.mockResolvedValue(mockUser);
    const result = await handler.execute(
      new GetUserBySubjectQuery(ctx, 'sub-1'),
    );
    expect(result).toBe(mockUser);
    expect(repo.get).toHaveBeenCalledWith(ctx, 'sub-1');
  });

  it('should return null when not found', async () => {
    repo.get.mockResolvedValue(null);
    const result = await handler.execute(
      new GetUserBySubjectQuery(ctx, 'missing'),
    );
    expect(result).toBeNull();
  });
});
