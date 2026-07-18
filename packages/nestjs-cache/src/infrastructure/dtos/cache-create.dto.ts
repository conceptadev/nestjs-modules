import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { CacheCreatableInterface } from '../../domain/interfaces/cache-creatable.interface.js';

import { CacheDto } from './cache.dto.js';
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
