import { CanActivate } from '@nestjs/common';

export type AuthRouterGuardsRecord = Record<string, CanActivate>;
