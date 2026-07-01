import { mock } from 'jest-mock-extended';

import { type VerifyService } from '../../../../application/services/verify/verify.service';
import { type VerifyUpdateDto } from '../dto/verify-update.dto';
import { type VerifyDto } from '../dto/verify.dto';

import { VerifyControllerFixture } from './fixtures/verify.controller.fixture';

describe(VerifyControllerFixture.name, () => {
  let controller: VerifyControllerFixture;
  let verifyService: VerifyService;
  const dto: VerifyDto = {
    email: 'test@example.com',
  };
  const verifyUpdateDto: VerifyUpdateDto = {
    passcode: '123456',
  };
  beforeEach(() => {
    verifyService = mock<VerifyService>();
    controller = new VerifyControllerFixture(verifyService);
  });

  describe('send', () => {
    it('should call send method of VerifyService', async () => {
      const verifySendSpy = jest.spyOn(verifyService, 'send');

      await controller.send({}, dto);

      expect(verifySendSpy).toHaveBeenCalledWith({}, { email: dto.email });
    });
  });

  describe('confirm', () => {
    it('should call confirmUser method of VerifyService', async () => {
      const confirmUserSpy = jest
        .spyOn(verifyService, 'confirmUser')
        .mockResolvedValue(null);

      await controller.confirm({}, verifyUpdateDto);

      expect(confirmUserSpy).toHaveBeenCalledWith(
        {},
        {
          passcode: verifyUpdateDto.passcode,
        },
      );
    });

    it('should call confirmUser method of VerifyService', async () => {
      const confirmUserSpy = jest
        .spyOn(verifyService, 'confirmUser')
        .mockResolvedValue({
          id: '1',
        });

      await controller.confirm({}, verifyUpdateDto);

      expect(confirmUserSpy).toHaveBeenCalledWith(
        {},
        {
          passcode: verifyUpdateDto.passcode,
        },
      );
    });
  });
});
