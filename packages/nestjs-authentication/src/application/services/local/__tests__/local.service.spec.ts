import { mock } from 'jest-mock-extended';

import { type PasswordPort } from '../../../../domain/ports/password.port';
import { type UserPort } from '../../../../domain/ports/user.port';
import { type LocalValidateUserInterface } from '../interfaces/local-validate-user.interface';
import { LocalService } from '../local.service';

describe(LocalService.name, () => {
  const USERNAME = 'test';
  const PASSWORD = 'test';

  let service: LocalService;
  let userPort: UserPort;
  let passwordPort: PasswordPort;

  beforeEach(() => {
    userPort = mock<UserPort>();
    passwordPort = mock<PasswordPort>();

    service = new LocalService(userPort, passwordPort);
  });

  describe('validateUser', () => {
    const USER = {
      active: false,
      id: 'uuid',
      username: 'username',
      email: 'user@test.com',
      password: 'password',
      passwordHash: 'hash',
      passwordSalt: 'salt',
    };
    it('should throw an error if no user is found for the given username', async () => {
      jest.spyOn(userPort, 'getByUsername').mockResolvedValue(null);

      const t = () =>
        service.validateUser({}, {
          username: USERNAME,
          password: PASSWORD,
        } as LocalValidateUserInterface);
      await expect(t).rejects.toThrow(
        `No user found for username: ${USERNAME}`,
      );
    });

    it('should throw an error if the user is inactive', async () => {
      jest.spyOn(userPort, 'getByUsername').mockResolvedValue(USER);

      const t = () =>
        service.validateUser({}, {
          username: USERNAME,
          password: PASSWORD,
        } as LocalValidateUserInterface);
      await expect(t).rejects.toThrow(
        `User with username '${USERNAME}' is inactive`,
      );
    });

    it('should throw an error if the password is invalid', async () => {
      jest
        .spyOn(userPort, 'getByUsername')
        .mockResolvedValue({ ...USER, active: true });
      jest.spyOn(passwordPort, 'validate').mockResolvedValue(false);

      const t = () =>
        service.validateUser({}, {
          username: USER.username,
          password: USER.password,
        } as LocalValidateUserInterface);
      await expect(t).rejects.toThrow(
        `Invalid password for username: ${USER.username}`,
      );
    });

    it('should return the user if the user is found, active, and the password is valid', async () => {
      const activeUser = { ...USER, active: true };
      jest.spyOn(userPort, 'getByUsername').mockResolvedValue(activeUser);
      jest.spyOn(passwordPort, 'validate').mockResolvedValue(true);

      const result = await service.validateUser({}, {
        username: USER.username,
        password: USER.password,
      } as LocalValidateUserInterface);

      expect(result).toEqual(activeUser);
    });
  });
});
