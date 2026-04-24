import { Injectable } from '@nestjs/common';

import { AuthGuard } from '../../auth.guard';

import { LOCAL_STRATEGY_NAME } from './local.constants';

@Injectable()
export class LocalGuard extends AuthGuard(LOCAL_STRATEGY_NAME, {
  canDisable: false,
}) {}
