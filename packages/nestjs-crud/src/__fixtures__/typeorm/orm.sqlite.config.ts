import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { CompanyEntity } from './company/company.entity';
import { DeviceEntity } from './device/device.entity';
import { NoteEntity } from './note/note.entity';
import { ProjectEntity } from './project/project.entity';
import { UserProfileEntity } from './user-profile/user-profile.entity';
import { UserEntity } from './users/user.entity';

export const ormSqliteConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [
    CompanyEntity,
    DeviceEntity,
    NoteEntity,
    ProjectEntity,
    UserProfileEntity,
    UserEntity,
  ],
  synchronize: true,
};
