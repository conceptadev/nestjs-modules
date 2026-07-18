import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { CacheUpdatableInterface } from '../../domain/interfaces/cache-updatable.interface.js';

import { CacheDto } from './cache.dto.js';

/**
 * Cache Update DTO
 */
@Exclude()
export class CacheUpdateDto
  extends PickType(CacheDto, ['data', 'expiresIn'] as const)
  implements CacheUpdatableInterface {}
