import { mock } from 'jest-mock-extended';

import { RecoveryPolicy } from '../../../../domain/policies/recovery.policy';
import { OtpPort } from '../../../../domain/ports/otp.port';
import { PasswordPort } from '../../../../domain/ports/password.port';
import { RecoveryNotificationPort } from '../../../../domain/ports/recovery-notification.port';
import { UserPort } from '../../../../domain/ports/user.port';
import { RecoveryService } from '../recovery.service';

describe(RecoveryService, () => {
  const UserFixture = {
    id: 'abc',
    email: 'me@dispostable.com',
    username: 'me@dispostable.com',
    active: true,
  };

  let recoveryService: RecoveryService;
  let otpPort: OtpPort;
  let userPort: UserPort;
  let passwordPort: PasswordPort;
  let recoveryNotificationPort: RecoveryNotificationPort;
  let policy: RecoveryPolicy;

  beforeEach(async () => {
    policy = new RecoveryPolicy({
      otp: {
        category: 'auth-recovery',
        namespace: 'userOtp',
        type: 'uuid',
        expiresIn: '1h',
        duplicateStrategy: 'DEACTIVATE',
        rateSeconds: 60,
        rateThreshold: 5,
      },
    });

    otpPort = mock<OtpPort>();
    userPort = mock<UserPort>();
    passwordPort = mock<PasswordPort>();
    recoveryNotificationPort = mock<RecoveryNotificationPort>();

    recoveryService = new RecoveryService(
      policy,
      otpPort,
      userPort,
      passwordPort,
      recoveryNotificationPort,
    );
  });

  describe(RecoveryService.prototype.recoverLogin, () => {
    it('should send login recovery', async () => {
      jest.spyOn(userPort, 'getByEmail').mockResolvedValue(UserFixture);

      const result = await recoveryService.recoverLogin({}, UserFixture.email);

      expect(result).toBeUndefined();
      expect(userPort.getByEmail).toHaveBeenCalledTimes(1);
      expect(userPort.getByEmail).toHaveBeenCalledWith({}, UserFixture.email);

      expect(recoveryNotificationPort.sendRecoverLogin).toHaveBeenCalledTimes(
        1,
      );
      expect(recoveryNotificationPort.sendRecoverLogin).toHaveBeenCalledWith(
        {},
        UserFixture.email,
        UserFixture.username,
      );
    });
  });

  describe(RecoveryService.prototype.recoverPassword, () => {
    it('should send password recovery', async () => {
      jest.spyOn(userPort, 'getByEmail').mockResolvedValue(UserFixture);
      jest.spyOn(otpPort, 'create').mockResolvedValue({
        category: 'auth-recovery',
        type: 'uuid',
        passcode: 'GOOD_PASSCODE',
        expirationDate: new Date(),
        active: true,
        assigneeId: UserFixture.id,
      });

      const result = await recoveryService.recoverPassword(
        {},
        UserFixture.email,
      );

      expect(result).toBeUndefined();
      expect(userPort.getByEmail).toHaveBeenCalledTimes(1);
      expect(userPort.getByEmail).toHaveBeenCalledWith({}, UserFixture.email);

      expect(
        recoveryNotificationPort.sendRecoverPassword,
      ).toHaveBeenCalledTimes(1);
      expect(recoveryNotificationPort.sendRecoverPassword).toHaveBeenCalledWith(
        {},
        UserFixture.email,
        {
          passcode: 'GOOD_PASSCODE',
          tokenExp: expect.any(Date),
        },
      );
    });
  });

  describe(RecoveryService.prototype.validatePasscode, () => {
    it('should call otp validator', async () => {
      jest
        .spyOn(otpPort, 'validate')
        .mockResolvedValue({ assigneeId: UserFixture.id });

      await recoveryService.validatePasscode({}, 'GOOD_PASSCODE');

      expect(otpPort.validate).toHaveBeenCalledWith({}, policy.otpNamespace, {
        category: policy.otpCategory,
        passcode: 'GOOD_PASSCODE',
      });
    });

    it('should validate good passcode', async () => {
      jest
        .spyOn(otpPort, 'validate')
        .mockResolvedValue({ assigneeId: UserFixture.id });

      const otp = await recoveryService.validatePasscode({}, 'GOOD_PASSCODE');
      expect(otp).toEqual({ assigneeId: UserFixture.id });
    });

    it('should not validate bad passcode', async () => {
      jest.spyOn(otpPort, 'validate').mockResolvedValue(null);

      const otp = await recoveryService.validatePasscode({}, 'BAD_PASSCODE');
      expect(otp).toBeNull();
    });
  });

  describe(RecoveryService.prototype.updatePassword, () => {
    it('should call password port setPassword', async () => {
      jest
        .spyOn(otpPort, 'validate')
        .mockResolvedValue({ assigneeId: UserFixture.id });
      jest.spyOn(userPort, 'getById').mockResolvedValue(UserFixture);
      jest.spyOn(userPort, 'getByEmail').mockResolvedValue(UserFixture);

      await recoveryService.updatePassword(
        {},
        'GOOD_PASSCODE',
        '$!Abc123bsksl6764579',
      );

      expect(passwordPort.setPassword).toHaveBeenCalledTimes(1);
      expect(passwordPort.setPassword).toHaveBeenCalledWith(
        {},
        '$!Abc123bsksl6764579',
        UserFixture.id,
      );
    });

    it('should send success email', async () => {
      jest
        .spyOn(otpPort, 'validate')
        .mockResolvedValue({ assigneeId: UserFixture.id });
      jest.spyOn(userPort, 'getById').mockResolvedValue(UserFixture);
      jest.spyOn(userPort, 'getByEmail').mockResolvedValue(UserFixture);

      await recoveryService.updatePassword(
        {},
        'GOOD_PASSCODE',
        'any_string_will_do',
      );

      expect(
        recoveryNotificationPort.sendPasswordUpdated,
      ).toHaveBeenCalledTimes(1);
      expect(recoveryNotificationPort.sendPasswordUpdated).toHaveBeenCalledWith(
        {},
        UserFixture.email,
      );
    });

    it('should update password', async () => {
      jest
        .spyOn(otpPort, 'validate')
        .mockResolvedValue({ assigneeId: UserFixture.id });
      jest.spyOn(userPort, 'getById').mockResolvedValue(UserFixture);
      jest.spyOn(userPort, 'getByEmail').mockResolvedValue(UserFixture);

      const user = await recoveryService.updatePassword(
        {},
        'GOOD_PASSCODE',
        '$!Abc123bsksl6764579',
      );

      expect(user).toEqual(UserFixture);
    });

    it('should fail to update password', async () => {
      jest.spyOn(otpPort, 'validate').mockResolvedValue(null);

      const user = await recoveryService.updatePassword(
        {},
        'FAKE_PASSCODE',
        '$!Abc123bsksl6764579',
      );

      expect(user).toBeNull();
    });
  });
});
