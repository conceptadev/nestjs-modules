import { Test, TestingModule } from '@nestjs/testing';

import { CRUD_MODULE_SETTINGS_TOKEN } from '../crud.constants';
import { CrudModule } from '../crud.module';
import { CrudModuleSettingsInterface } from '../infrastructure/config/interfaces/crud-module-settings.interface';

describe(CrudModule, () => {
  let crudModule: CrudModule;
  let crudSettings: CrudModuleSettingsInterface;

  describe(CrudModule.register, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.register({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forRoot, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.forRoot({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.registerAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.registerAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forRootAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.forRootAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  function setProviderVars(testModule: TestingModule) {
    crudModule = testModule.get<CrudModule>(CrudModule);
    crudSettings = testModule.get<CrudModuleSettingsInterface>(
      CRUD_MODULE_SETTINGS_TOKEN,
    );
  }

  function commonProviderTests() {
    it('providers should be loaded', async () => {
      expect(crudModule).toBeInstanceOf(CrudModule);
      expect(crudSettings).toBeInstanceOf(Object);
    });
  }
});
