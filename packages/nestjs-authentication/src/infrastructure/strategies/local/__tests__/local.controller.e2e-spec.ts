import supertest from 'supertest';

import { type INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { ExceptionsFilter } from '@concepta/nestjs-core';
import { PasswordValidationService } from '@concepta/nestjs-password';

import { LocalService } from '../../../../application/services/local/local.service';
import { LocalInvalidCredentialsException } from '../exceptions/local-invalid-credentials.exception';

import { AppModuleFixture } from './fixtures/app.module.fixture';
import { LOGIN_SUCCESS } from './fixtures/constants';
import { LocalControllerFixture } from './fixtures/local.controller.fixture';

describe('AuthLocalController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
      controllers: [LocalControllerFixture],
    })
      .overrideProvider(PasswordValidationService)
      .useValue({
        validate: () => {
          return true;
        },
      })
      .compile();
    app = moduleFixture.createNestApplication();

    const exceptionsFilter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(exceptionsFilter));

    await app.init();
  });

  it('POST auth/login success', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send(LOGIN_SUCCESS)
      .then((response) => {
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.status).toBe(201);
      });
  });

  it('POST auth/login username not found ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 'no_user',
      })
      .then((response) => {
        expect(response.body.message).toBe(
          'The provided username or password is incorrect. Please try again.',
        );
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username not found with custom message', async () => {
    const validateUserService = app.get(LocalService);

    vi.spyOn(validateUserService, 'validateUser').mockImplementationOnce(() => {
      throw new LocalInvalidCredentialsException({
        safeMessage: 'Custom invalid credentials message',
      });
    });

    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 'no_user',
      })
      .then((response) => {
        expect(response.body.message).toBe(
          'Custom invalid credentials message',
        );
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login password fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        password: '',
      })
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: '',
      })
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 999,
      })
      .then((response) => {
        expect(response.body.message).toBe(
          'The login data provided is invalid.',
        );
        expect(response.status).toBe(400);
      });
  });

  it('POST auth/login password fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        password: 999,
      })
      .then((response) => {
        expect(response.body.message).toBe(
          'The login data provided is invalid.',
        );
        expect(response.status).toBe(400);
      });
  });
});
