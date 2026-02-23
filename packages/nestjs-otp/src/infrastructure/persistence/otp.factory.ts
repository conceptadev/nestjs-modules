import { randomUUID } from 'crypto';

import { faker } from '@faker-js/faker';

import { OtpInterface } from '@concepta/nestjs-common';
import { Factory } from '@concepta/typeorm-seeding';

/**
 * Otp factory
 */
export class OtpFactory extends Factory<OtpInterface> {
  /**
   * List of used categories.
   */
  categories: string[] = ['one', 'two', 'three'];

  /**
   * Factory callback function.
   */
  protected async entity(otp: OtpInterface): Promise<OtpInterface> {
    otp.category = faker.helpers.arrayElement(this.categories);
    otp.type = 'uuid';
    otp.passcode = randomUUID();

    return otp;
  }
}
