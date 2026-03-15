import { Controller } from '@nestjs/common';

import { ActionEnum } from '@concepta/nestjs-common';

import { ACCESS_CONTROL_MODULE_GRANT_METADATA } from '../constants';

import { AccessControlReplaceOne } from './access-control-replace-one.decorator';

describe('@AccessControlUpdateOne', () => {
  const resource = 'a_protected_resource';

  @Controller()
  class TestController {
    @AccessControlReplaceOne(resource)
    replaceOne() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.replaceOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: ActionEnum.UPDATE,
        },
      ]);
    });
  });
});
