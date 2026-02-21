import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { CacheCreatableInterface } from '@concepta/nestjs-common';

import { CacheDto } from './cache.dto';
/**
 * Cache Create DTO
 */
@Exclude()
export class CacheCreateDto
  extends PickType(CacheDto, [
    'key',
    'data',
    'type',
    'expiresIn',
    'assigneeId',
  ] as const)
  implements CacheCreatableInterface {}
