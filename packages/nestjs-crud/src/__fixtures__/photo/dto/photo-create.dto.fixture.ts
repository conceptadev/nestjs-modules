import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { PhotoCreatableInterfaceFixture } from '../interfaces/photo-creatable.interface.fixture.js';

import { PhotoDtoFixture } from './photo.dto.fixture.js';

@Exclude()
export class PhotoCreateDtoFixture
  extends PickType(PhotoDtoFixture, [
    'name',
    'description',
    'filename',
    'isPublished',
  ] as const)
  implements PhotoCreatableInterfaceFixture {}
