import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../../jwt.guard';

@Controller('user')
@UseGuards(JwtGuard)
export class UserControllerFixtures {
  /**
   * Status
   */
  @Get('status')
  getStatus(): boolean {
    return true;
  }
}
