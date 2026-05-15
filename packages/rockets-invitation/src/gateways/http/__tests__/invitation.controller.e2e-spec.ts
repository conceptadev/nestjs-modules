import { randomUUID } from 'crypto';

import supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { SeedingSource } from '@concepta/typeorm-seeding';

import { InvitationCreatableInterface } from '../../../domain/interfaces/invitation-creatable.interface';
import { InvitationOtpPort } from '../../../domain/ports/invitation-otp.port';
import { InvitationAcceptDto } from '../../../infrastructure/dtos/invitation-accept.dto';
import { InvitationDto } from '../../../infrastructure/dtos/invitation.dto';
import { InvitationEntityInterface } from '../../../infrastructure/persistence/interfaces/invitation-entity.interface';
import { InvitationFactory } from '../../../seeding/invitation.factory';

import { AppCrudModuleFixture } from './fixtures/app-crud.module.fixture';
import { InvitationEntityFixture } from './fixtures/entities/invitation.entity.fixture';
import { UserEntityFixture } from './fixtures/entities/user.entity.fixture';

describe('InvitationController (e2e)', () => {
  const userCategory = 'user';
  const orgCategory = 'org';
  const constraints = { moreData: 'foo' };

  let app: INestApplication;
  let invitationFactory: InvitationFactory;
  let seedingSource: SeedingSource;
  let user: UserEntityFixture;
  let otpPort: InvitationOtpPort;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppCrudModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    otpPort = moduleFixture.get<InvitationOtpPort>(InvitationOtpPort);

    seedingSource = new SeedingSource({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    invitationFactory = new InvitationFactory({
      entity: InvitationEntityFixture,
      seedingSource,
    });

    // Seed a user directly via TypeORM
    const dataSource = moduleFixture.get(getDataSourceToken());
    const userRepo = dataSource.getRepository(UserEntityFixture);
    user = await userRepo.save(
      userRepo.create({
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        active: true,
      }),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (app) await app.close();
  });

  describe('Type: org', () => {
    let invitation: InvitationEntityInterface;

    beforeEach(async () => {
      invitation = await invitationFactory.create({
        category: orgCategory,
        userId: user.id,
      });
    });

    it('POST /invitation', async () => {
      await createInvitation(app, {
        category: orgCategory,
        userId: user.id,
        code: randomUUID(),
        constraints,
      });
    });

    it('PATCH /invitation-acceptance/:code', async () => {
      const { code } = invitation;
      const otp = await otpPort.create({}, orgCategory, user.id);

      await supertest(app.getHttpServer())
        .patch(`/invitation-acceptance/${code}`)
        .send({
          passcode: otp.passcode,
          payload: { newPassword: 'hOdv2A2h%' },
        } as InvitationAcceptDto)
        .expect(200);
    });
  });

  describe('Type: user', () => {
    let invitation: InvitationEntityInterface;

    beforeEach(async () => {
      invitation = await invitationFactory.create({
        category: userCategory,
        userId: user.id,
      });
    });

    it('POST /invitation', async () => {
      await createInvitation(app, {
        category: userCategory,
        userId: user.id,
        code: randomUUID(),
        constraints,
      });
    });

    it('PATCH /invitation-acceptance/:code', async () => {
      const { code } = invitation;
      const otp = await otpPort.create({}, userCategory, user.id);

      await supertest(app.getHttpServer())
        .patch(`/invitation-acceptance/${code}`)
        .send({
          passcode: otp.passcode,
          payload: { newPassword: 'hOdv2A2h%' },
        } as InvitationAcceptDto)
        .expect(200);
    });

    it('GET /invitation', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/invitation')
        .expect(200);

      const invitationResponse = response.body.data as InvitationDto[];

      expect(invitationResponse.length).toEqual(1);
    });

    it('GET /invitation/:id', async () => {
      const created = await createInvitation(app, {
        category: userCategory,
        userId: user.id,
        code: randomUUID(),
        constraints,
      });

      const response = await supertest(app.getHttpServer())
        .get(`/invitation/${created.id}`)
        .expect(200);

      const invitationResponse = response.body as InvitationDto;
      expect(invitationResponse.category).toEqual(userCategory);
    });

    it('DELETE /invitation/:id', async () => {
      const created = await createInvitation(app, {
        category: userCategory,
        userId: user.id,
        code: randomUUID(),
        constraints,
      });

      await supertest(app.getHttpServer())
        .delete(`/invitation/${created.id}`)
        .expect(204);

      await supertest(app.getHttpServer())
        .get(`/invitation/${created.id}`)
        .expect(404);
    });
  });
});

const createInvitation = async (
  app: INestApplication,
  dto: InvitationCreatableInterface,
): Promise<InvitationDto> => {
  const response = await supertest(app.getHttpServer())
    .post('/invitation')
    .send(dto)
    .expect(201);

  return response.body as InvitationDto;
};
