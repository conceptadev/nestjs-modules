import { ApiTags } from '@nestjs/swagger';

import {
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlCreateOne,
  AccessControlUpdateOne,
  AccessControlReplaceOne,
  AccessControlDeleteOne,
  AccessControlRecoverOne,
} from '@concepta/nestjs-access-control';
import { ConfigurableCrudOptions } from '@concepta/nestjs-crud';

import { UserProfileCreateDto } from '../dto/profile/user-profile-create.dto';
import { UserProfilePaginatedDto } from '../dto/profile/user-profile-paginated.dto';
import { UserProfileUpdateDto } from '../dto/profile/user-profile-update.dto';
import { UserProfileDto } from '../dto/profile/user-profile.dto';
import { USER_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN } from '../user.constants';
import { UserProfileResource } from '../user.types';

import { UserProfileTypeOrmCrudAdapterFixture } from './services/user-profile-typeorm-crud.adapter.fixture';
import { UserProfileEntityFixture } from './user-profile.entity.fixture';

export const USER_PROFILE_CRUD_OPTIONS_DEFAULT: ConfigurableCrudOptions<UserProfileEntityFixture> =
  {
    service: {
      adapterToken:
        UserProfileTypeOrmCrudAdapterFixture<UserProfileEntityFixture>,
      serviceToken: USER_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN,
    },
    controller: {
      path: 'user-profile',
      model: {
        type: UserProfileDto,
        paginatedType: UserProfilePaginatedDto,
      },
      extraDecorators: [ApiTags('user-profile')],
    },
    getMany: {
      extraDecorators: [AccessControlReadMany(UserProfileResource.Many)],
    },
    getOne: {
      extraDecorators: [AccessControlReadOne(UserProfileResource.One)],
    },
    createOne: {
      dto: UserProfileCreateDto,
      extraDecorators: [AccessControlCreateOne(UserProfileResource.One)],
    },
    updateOne: {
      dto: UserProfileUpdateDto,
      extraDecorators: [AccessControlUpdateOne(UserProfileResource.One)],
    },
    replaceOne: {
      dto: UserProfileUpdateDto,
      extraDecorators: [AccessControlReplaceOne(UserProfileResource.One)],
    },
    deleteOne: {
      extraDecorators: [AccessControlDeleteOne(UserProfileResource.One)],
    },
    recoverOne: {
      path: 'recover/:id',
      extraDecorators: [AccessControlRecoverOne(UserProfileResource.One)],
    },
  };
