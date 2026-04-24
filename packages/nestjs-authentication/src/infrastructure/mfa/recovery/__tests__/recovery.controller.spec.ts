import { mock } from 'jest-mock-extended';

import { RecoveryService } from '../../../../application/services/recovery/recovery.service';
import { RecoveryRecoverLoginDto } from '../dto/recovery-recover-login.dto';
import { RecoveryUpdatePasswordDto } from '../dto/recovery-update-password.dto';
import { RecoveryOtpInvalidException } from '../exceptions/recovery-otp-invalid.exception';

import { RecoveryController } from './fixtures/recovery.controller.fixture';

describe(RecoveryController.name, () => {
  let controller: RecoveryController;
  let recoveryService: RecoveryService;
  const dto: RecoveryRecoverLoginDto = {
    email: 'test@example.com',
  };
  const passwordDto: RecoveryUpdatePasswordDto = {
    passcode: '123456',
    newPassword: 'newPassword',
  };
  beforeEach(() => {
    recoveryService = mock<RecoveryService>();
    controller = new RecoveryController(recoveryService);
  });

  describe('recoverLogin', () => {
    it('should call recoverLogin method of RecoveryService', async () => {
      const recoverLoginSpy = jest.spyOn(recoveryService, 'recoverLogin');

      await controller.recoverLogin({}, dto);

      expect(recoverLoginSpy).toHaveBeenCalledWith({}, dto.email);
    });
  });

  describe('recoverPassword', () => {
    it('should call recoverPassword method of RecoveryService', async () => {
      const recoverPasswordSpy = jest.spyOn(recoveryService, 'recoverPassword');

      await controller.recoverPassword({}, dto);

      expect(recoverPasswordSpy).toHaveBeenCalledWith({}, dto.email);
    });
  });

  describe('validatePasscode', () => {
    it('should call validatePasscode method of RecoveryService', async () => {
      const validatePasscodeSpy = jest
        .spyOn(recoveryService, 'validatePasscode')
        .mockResolvedValue(null);

      const t = () => controller.validatePasscode({}, passwordDto.passcode);
      await expect(t).rejects.toThrow(RecoveryOtpInvalidException);

      expect(validatePasscodeSpy).toHaveBeenCalledWith(
        {},
        passwordDto.passcode,
      );
    });

    it('should call validatePasscode method of RecoveryService', async () => {
      const validatePasscodeSpy = jest
        .spyOn(recoveryService, 'validatePasscode')
        .mockResolvedValue({
          assigneeId: '1',
        });

      await controller.validatePasscode({}, passwordDto.passcode);

      expect(validatePasscodeSpy).toHaveBeenCalledWith(
        {},
        passwordDto.passcode,
      );
    });
  });

  describe('updatePassword', () => {
    it('should call updatePassword method of RecoveryService', async () => {
      const updatePasswordSpy = jest
        .spyOn(recoveryService, 'updatePassword')
        .mockResolvedValue(null);

      const t = () => controller.updatePassword({}, passwordDto);
      await expect(t).rejects.toThrow(RecoveryOtpInvalidException);

      expect(updatePasswordSpy).toHaveBeenCalledWith(
        {},
        passwordDto.passcode,
        passwordDto.newPassword,
      );
    });

    it('should call updatePassword method of RecoveryService', async () => {
      const updatePasswordSpy = jest
        .spyOn(recoveryService, 'updatePassword')
        .mockResolvedValue({
          id: '1',
        });

      await controller.updatePassword({}, passwordDto);

      expect(updatePasswordSpy).toHaveBeenCalledWith(
        {},
        passwordDto.passcode,
        passwordDto.newPassword,
      );
    });
  });
});
