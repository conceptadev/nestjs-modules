import { Entity } from 'typeorm';

import { OtpSqliteEntity } from '@concepta/nestjs-repository-typeorm';

@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {}
