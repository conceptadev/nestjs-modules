import supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { ExceptionsFilter } from '@concepta/nestjs-core';

import { AppModuleFixture } from '../../../../__tests__/fixtures/app.module.fixture';
import { VerifyOtpInvalidException } from '../../../../application/exceptions/verify-otp-invalid.exception';
import { VerifyService } from '../../../../application/services/verify/verify.service';

import { VerifyControllerFixture } from './fixtures/verify.controller.fixture';

describe('VerifyController (e2e)', () => {
  let app: INestApplication;

  const mockVerifyService = {
    send: jest.fn().mockResolvedValue(undefined),
    confirmUser: jest.fn(),
    validatePasscode: jest.fn(),
    revokeAllUserVerifyToken: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
      controllers: [VerifyControllerFixture],
    })
      .overrideProvider(VerifyService)
      .useValue(mockVerifyService)
      .compile();

    app = moduleFixture.createNestApplication();

    const exceptionsFilter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(exceptionsFilter));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/verify/send', () => {
    it('should return 201 and call send', async () => {
      await supertest(app.getHttpServer())
        .post('/auth/verify/send')
        .send({ email: 'user@example.com' })
        .expect(201);

      expect(mockVerifyService.send).toHaveBeenCalledWith(expect.any(Object), {
        email: 'user@example.com',
      });
    });
  });

  describe('PATCH /auth/verify/confirm', () => {
    it('should return 200 when passcode is valid', async () => {
      mockVerifyService.confirmUser.mockResolvedValueOnce({ id: 'user-1' });

      await supertest(app.getHttpServer())
        .patch('/auth/verify/confirm')
        .send({ passcode: 'valid-passcode' })
        .expect(200);

      expect(mockVerifyService.confirmUser).toHaveBeenCalledWith(
        expect.any(Object),
        { passcode: 'valid-passcode' },
      );
    });

    it('should return 400 when service throws VerifyOtpInvalidException', async () => {
      mockVerifyService.confirmUser.mockRejectedValueOnce(
        new VerifyOtpInvalidException(),
      );

      await supertest(app.getHttpServer())
        .patch('/auth/verify/confirm')
        .send({ passcode: 'bad-passcode' })
        .expect(400);
    });
  });
});
