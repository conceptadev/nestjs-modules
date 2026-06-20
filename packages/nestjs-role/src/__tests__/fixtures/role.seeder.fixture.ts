import { Seeder } from '@concepta/typeorm-seeding';

import { RoleFactory } from '../../infrastructure/persistence/role.factory';

/**
 * Role seeder
 */
export class RoleSeederFixture extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    const createAmount = process.env?.ROLE_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ROLE_MODULE_SEEDER_AMOUNT)
      : 50;

    const roleFactory = this.factory(RoleFactory);

    await roleFactory.createMany(createAmount);
  }
}
