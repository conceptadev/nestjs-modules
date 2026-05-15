import { Entity } from 'typeorm';

import { OtpSqliteEntity } from '@concepta/rockets-otp/optional/typeorm';

@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {}
