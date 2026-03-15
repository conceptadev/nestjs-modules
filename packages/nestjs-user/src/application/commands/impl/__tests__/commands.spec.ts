import {
  PasswordUpdateInterface,
  RepositoryContextInterface,
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

import { CreateUserCredentialCommand } from '../create-user-credential.command';
import { CreateUserCommand } from '../create-user.command';
import { RemoveUserCommand } from '../remove-user.command';
import { SetUserPasswordCommand } from '../set-user-password.command';
import { UpdateUserCredentialCommand } from '../update-user-credential.command';
import { UpdateUserPasswordCommand } from '../update-user-password.command';
import { UpdateUserCommand } from '../update-user.command';

const ctx = {} as RepositoryContextInterface;

describe(CreateUserCommand.name, () => {
  it('should store ctx and dto', () => {
    const dto: UserCreatableInterface = {
      email: 'a@b.com',
      username: 'john',
    };
    const cmd = new CreateUserCommand(ctx, dto);
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.dto).toBe(dto);
  });
});

describe(UpdateUserCommand.name, () => {
  it('should store ctx, id, and dto', () => {
    const dto: Partial<UserUpdatableInterface> = { active: false };
    const cmd = new UpdateUserCommand(ctx, 'user-1', dto);
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.id).toBe('user-1');
    expect(cmd.dto).toBe(dto);
  });
});

describe(RemoveUserCommand.name, () => {
  it('should store ctx and id', () => {
    const cmd = new RemoveUserCommand(ctx, 'user-1');
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.id).toBe('user-1');
  });
});

describe(SetUserPasswordCommand.name, () => {
  it('should store ctx, userId, and password', () => {
    const cmd = new SetUserPasswordCommand(ctx, 'user-1', 'pass123');
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.userId).toBe('user-1');
    expect(cmd.password).toBe('pass123');
  });
});

describe(CreateUserCredentialCommand.name, () => {
  it('should store ctx, userId, and password', () => {
    const cmd = new CreateUserCredentialCommand(ctx, 'user-1', 'pass123');
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.userId).toBe('user-1');
    expect(cmd.password).toBe('pass123');
  });
});

describe(UpdateUserPasswordCommand.name, () => {
  it('should store ctx, userId, and passwordDto', () => {
    const passwordDto: PasswordUpdateInterface = {
      password: 'new-pass',
      passwordCurrent: 'old-pass',
    };
    const cmd = new UpdateUserPasswordCommand(ctx, 'user-1', passwordDto);
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.userId).toBe('user-1');
    expect(cmd.passwordDto).toBe(passwordDto);
  });
});

describe(UpdateUserCredentialCommand.name, () => {
  it('should store ctx, userId, and passwordDto', () => {
    const passwordDto: PasswordUpdateInterface = {
      password: 'new-pass',
    };
    const cmd = new UpdateUserCredentialCommand(ctx, 'user-1', passwordDto);
    expect(cmd.ctx).toBe(ctx);
    expect(cmd.userId).toBe('user-1');
    expect(cmd.passwordDto).toBe(passwordDto);
  });
});
