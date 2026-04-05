import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { CacheUpdatableInterface } from '../../domain/interfaces/cache-updatable.interface';

import { CacheDto } from './cache.dto';

/**
 * Cache Update DTO
 */
@Exclude()
export class CacheUpdateDto
  extends PickType(CacheDto, ['data', 'expiresIn'] as const)
  implements CacheUpdatableInterface {}
