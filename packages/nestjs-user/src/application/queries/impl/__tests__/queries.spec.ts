import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { GetUserByEmailQuery } from '../get-user-by-email.query';
import { GetUserBySubjectQuery } from '../get-user-by-subject.query';
import { GetUserByUsernameQuery } from '../get-user-by-username.query';
import { GetUserQuery } from '../get-user.query';

const ctx = {} as RepositoryContextInterface;

describe(GetUserQuery.name, () => {
  it('should store ctx and id', () => {
    const query = new GetUserQuery(ctx, 'user-1');
    expect(query.ctx).toBe(ctx);
    expect(query.id).toBe('user-1');
  });
});

describe(GetUserByEmailQuery.name, () => {
  it('should store ctx and email', () => {
    const query = new GetUserByEmailQuery(ctx, 'a@b.com');
    expect(query.ctx).toBe(ctx);
    expect(query.email).toBe('a@b.com');
  });
});

describe(GetUserByUsernameQuery.name, () => {
  it('should store ctx and username', () => {
    const query = new GetUserByUsernameQuery(ctx, 'john');
    expect(query.ctx).toBe(ctx);
    expect(query.username).toBe('john');
  });
});

describe(GetUserBySubjectQuery.name, () => {
  it('should store ctx and subject', () => {
    const query = new GetUserBySubjectQuery(ctx, 'sub-1');
    expect(query.ctx).toBe(ctx);
    expect(query.subject).toBe('sub-1');
  });
});
