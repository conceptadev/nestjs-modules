import { Controller } from '@nestjs/common';

import { ActionEnum } from '@concepta/nestjs-common';

import { ACCESS_CONTROL_MODULE_GRANT_METADATA } from '../constants';

import { AccessControlReadOne } from './access-control-read-one.decorator';

describe('@AccessControlReadOne', () => {
  const resource = 'a_protected_resource';

  @Controller()
  class TestController {
    @AccessControlReadOne(resource)
    getOne() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.getOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: ActionEnum.READ,
        },
      ]);
    });
  });
});
