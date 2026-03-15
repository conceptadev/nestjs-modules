import { DynamicModule, Type } from '@nestjs/common';

import { UserCredentialsRepositoryInterface } from '../../../domain/repositories/user-credentials-repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user-repository.interface';

export interface UserExtrasInterface extends Pick<DynamicModule, 'global'> {
  entities: {
    user: string;
    credentials?: string;
  };
  repositories?: {
    user?: Type<UserRepositoryInterface>;
    userCredentials?: Type<UserCredentialsRepositoryInterface>;
  };
}
