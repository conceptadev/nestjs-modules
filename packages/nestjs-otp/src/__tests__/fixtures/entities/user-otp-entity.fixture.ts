import { Entity } from 'typeorm';

import { OtpSqliteEntity } from '@concepta/nestjs-repository-typeorm';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {}
