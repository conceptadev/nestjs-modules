import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Operation } from '@concepta/nestjs-common';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import {
  CreateOtpCommand,
  ConsumeOtpCommand,
  ClearOtpsCommand,
  ValidateOtpQuery,
  OtpModule,
} from '@concepta/nestjs-otp';
import {
  PasswordModule,
  CreatePasswordCommand,
  ValidateCurrentPasswordCommand,
} from '@concepta/nestjs-password';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';
import {
  GetUserQuery,
  GetUserByEmailQuery,
  UserModule,
} from '@concepta/nestjs-user';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';
import { InvitationCreateDto } from '../../../../infrastructure/dtos/invitation-create.dto';
import { InvitationPaginatedDto } from '../../../../infrastructure/dtos/invitation-paginated.dto';
import { InvitationDto } from '../../../../infrastructure/dtos/invitation.dto';
import { INVITATION_MODULE_DEFAULT_ENTITY_KEY } from '../../../../invitation.constants';
import { InvitationModule } from '../../../../invitation.module';
import { AcceptInvitationRequestHandler } from '../../commands/handlers/accept-invitation-request.handler';
import { CreateInvitationRequestHandler } from '../../commands/handlers/create-invitation-request.handler';
import { DeleteInvitationRequestHandler } from '../../commands/handlers/delete-invitation-request.handler';
import { CreateInvitationRequest } from '../../commands/impl/create-invitation.request';
import { DeleteInvitationRequest } from '../../commands/impl/delete-invitation.request';
import { ListInvitationsRequestHandler } from '../../queries/handlers/list-invitations-request.handler';
import { ReadInvitationRequestHandler } from '../../queries/handlers/read-invitation-request.handler';
import { ListInvitationsRequest } from '../../queries/impl/list-invitations.request';
import { ReadInvitationRequest } from '../../queries/impl/read-invitation.request';

import {
  NoopSendInvitationEmailCommand,
  NoopSendAcceptedEmailCommand,
} from './email/noop-email.command';
import {
  NoopSendInvitationEmailHandler,
  NoopSendAcceptedEmailHandler,
} from './email/noop-email.handler';
import { InvitationEntityFixture } from './entities/invitation.entity.fixture';
import { UserCredentialEntityFixture } from './entities/user-credential.entity.fixture';
import { UserOtpEntityFixture } from './entities/user-otp.entity.fixture';
import { UserEntityFixture } from './entities/user.entity.fixture';
import { InvitationAcceptanceController } from './invitation-acceptance.controller';

const USER_ENTITY_KEY = 'user';
const USER_CREDENTIALS_ENTITY_KEY = 'user-credentials';
const USER_OTP_ENTITY_KEY = 'user-otp';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [
        InvitationEntityFixture,
        UserEntityFixture,
        UserCredentialEntityFixture,
        UserOtpEntityFixture,
      ],
    }),
    CqrsModule.forRoot(),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        {
          key: INVITATION_MODULE_DEFAULT_ENTITY_KEY,
          entity: InvitationEntityFixture,
        },
        { key: USER_ENTITY_KEY, entity: UserEntityFixture },
        {
          key: USER_CREDENTIALS_ENTITY_KEY,
          entity: UserCredentialEntityFixture,
        },
        { key: USER_OTP_ENTITY_KEY, entity: UserOtpEntityFixture },
      ],
    }),
    PasswordModule.forRoot({}),
    OtpModule.forRoot({}),
    OtpModule.forFeature([USER_OTP_ENTITY_KEY]),
    UserModule.forRoot({
      entities: {
        user: USER_ENTITY_KEY,
        credentials: USER_CREDENTIALS_ENTITY_KEY,
      },
      ports: {
        password: {
          createCommand: CreatePasswordCommand,
          validateCurrentCommand: ValidateCurrentPasswordCommand,
        },
      },
    }),
    InvitationModule.registerAsync({
      useFactory: () => ({
        ports: {
          otp: {
            createCommand: CreateOtpCommand,
            consumeCommand: ConsumeOtpCommand,
            clearCommand: ClearOtpsCommand,
            validateQuery: ValidateOtpQuery,
          },
          user: {
            getByIdQuery: GetUserQuery,
            getByEmailQuery: GetUserByEmailQuery,
          },
          email: {
            sendInvitationCommand: NoopSendInvitationEmailCommand,
            sendAcceptedCommand: NoopSendAcceptedEmailCommand,
          },
        },
      }),
    }),
    CrudModule.forFeature<InvitationInterface>({
      crud: {
        controller: {
          entity: INVITATION_MODULE_DEFAULT_ENTITY_KEY,
          path: 'invitation',
          resolver: CrudCqrsResolver,
          transactional: true,
          request: { body: InvitationCreateDto },
          response: {
            resource: InvitationDto,
            paginated: InvitationPaginatedDto,
          },
        },
        operations: [
          {
            operation: Operation.List,
            query: ListInvitationsRequest,
            queryHandler: ListInvitationsRequestHandler,
          },
          {
            operation: Operation.Read,
            query: ReadInvitationRequest,
            queryHandler: ReadInvitationRequestHandler,
          },
          {
            operation: Operation.Create,
            request: { body: InvitationCreateDto },
            command: CreateInvitationRequest,
            commandHandler: CreateInvitationRequestHandler,
          },
          {
            operation: Operation.Delete,
            command: DeleteInvitationRequest,
            commandHandler: DeleteInvitationRequestHandler,
          },
        ],
      },
    }),
  ],
  providers: [
    NoopSendInvitationEmailHandler,
    NoopSendAcceptedEmailHandler,
    AcceptInvitationRequestHandler,
  ],
  controllers: [InvitationAcceptanceController],
})
export class AppCrudModuleFixture {}
