import { CrudRequestBodyBatch } from '../../decorators/routes/crud-request-body-batch.decorator';
import { CrudRequestBody } from '../../decorators/routes/crud-request-body.decorator';
import { CrudResponseResource } from '../../decorators/routes/crud-response-resource.decorator';
import { CrudReturnRestored } from '../../decorators/routes/crud-return-restored.decorator';
import { CrudValidate } from '../../decorators/routes/crud-validate.decorator';
import { CrudMetaview } from '../crud-metaview.service';

describe('CrudMetaview', () => {
  const metaview = new CrudMetaview();

  describe('getValidationOptions', () => {
    it('should resolve from handler then class when handler is provided', () => {
      @CrudValidate({ always: true })
      class TestController {
        @CrudValidate({ whitelist: true })
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getValidationOptions(TestController, handler);
      expect(result).toEqual({ whitelist: true });
    });

    it('should fall back to class when handler has no metadata', () => {
      @CrudValidate({ always: true })
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getValidationOptions(TestController, handler);
      expect(result).toEqual({ always: true });
    });

    it('should resolve from target when handler is omitted', () => {
      @CrudValidate({ always: true })
      class TestController {
        testMethod() {}
      }

      const result = metaview.getValidationOptions(TestController);
      expect(result).toEqual({ always: true });
    });
  });

  describe('getRequestBodyBatch', () => {
    it('should resolve batch body type from method', () => {
      class BatchDto {}

      class TestController {
        @CrudRequestBodyBatch(BatchDto)
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getRequestBodyBatch(TestController, handler);
      expect(result).toBe(BatchDto);
    });

    it('should resolve batch body type from class', () => {
      class BatchDto {}

      @CrudRequestBodyBatch(BatchDto)
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getRequestBodyBatch(TestController, handler);
      expect(result).toBe(BatchDto);
    });

    it('should return undefined when not decorated', () => {
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getRequestBodyBatch(TestController, handler);
      expect(result).toBeUndefined();
    });
  });

  describe('getReturnRestored', () => {
    it('should return true when decorated', () => {
      @CrudReturnRestored(true)
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getReturnRestored(TestController, handler);
      expect(result).toBe(true);
    });

    it('should default to false when not decorated', () => {
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getReturnRestored(TestController, handler);
      expect(result).toBe(false);
    });
  });

  describe('getRequestBody', () => {
    it('should resolve body type from method', () => {
      class BodyDto {}

      class TestController {
        @CrudRequestBody(BodyDto)
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getRequestBody(TestController, handler);
      expect(result).toBe(BodyDto);
    });

    it('should return undefined when not decorated', () => {
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getRequestBody(TestController, handler);
      expect(result).toBeUndefined();
    });
  });

  describe('getResponseResource', () => {
    it('should resolve response type from method', () => {
      class ResourceDto {}

      class TestController {
        @CrudResponseResource(ResourceDto)
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getResponseResource(TestController, handler);
      expect(result).toBe(ResourceDto);
    });

    it('should return undefined when not decorated', () => {
      class TestController {
        testMethod() {}
      }

      const handler = TestController.prototype.testMethod;
      const result = metaview.getResponseResource(TestController, handler);
      expect(result).toBeUndefined();
    });
  });
});
