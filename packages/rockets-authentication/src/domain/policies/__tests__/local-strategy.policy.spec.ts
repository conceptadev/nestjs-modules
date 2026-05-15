import { LocalStrategyPolicy } from '../local-strategy.policy';

class MockLoginDto {}

describe(LocalStrategyPolicy.name, () => {
  it('should create with default values', () => {
    const policy = new LocalStrategyPolicy({});

    expect(policy.loginDto).toBeUndefined();
    expect(policy.usernameField).toBe('username');
    expect(policy.passwordField).toBe('password');
  });

  it('should create with provided settings', () => {
    const policy = new LocalStrategyPolicy({
      loginDto: MockLoginDto,
      usernameField: 'email',
      passwordField: 'passcode',
    });

    expect(policy.loginDto).toBe(MockLoginDto);
    expect(policy.usernameField).toBe('email');
    expect(policy.passwordField).toBe('passcode');
  });

  it('should use defaults when optional fields omitted', () => {
    const policy = new LocalStrategyPolicy({
      loginDto: MockLoginDto,
    });

    expect(policy.loginDto).toBe(MockLoginDto);
    expect(policy.usernameField).toBe('username');
    expect(policy.passwordField).toBe('password');
  });
});
