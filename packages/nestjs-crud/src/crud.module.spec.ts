import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { CrudAdapter } from './crud/adapters/crud.adapter';
import { TypeOrmCrudAdapter } from './crud/adapters/typeorm-crud.adapter';
import { CRUD_MODULE_SETTINGS_TOKEN } from './crud.constants';
import { CrudModule } from './crud.module';
import { CrudModuleSettingsInterface } from './interfaces/crud-module-settings.interface';
import { CrudService } from './services/crud.service';
import {
  getDynamicCrudAdapterToken,
  InjectDynamicCrudAdapter,
} from './util/inject-dynamic-crud-adapter.decorator';
import { getDynamicCrudServiceToken } from './util/inject-dynamic-crud-service.decorator';

import { CRUD_TEST_COMPANY_ENTITY_KEY } from './__fixtures__/crud-test.constants';
import { CompanyEntity } from './__fixtures__/typeorm/company/company.entity';
import { ormSqliteConfig } from './__fixtures__/typeorm/orm.sqlite.config';

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

  describe('forFeature with empty options', () => {
    @Module({
      imports: [CrudModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Module({
      imports: [AppGlobalTest, CrudModule.forFeature({})],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe('forFeature with settings override', () => {
    @Module({
      imports: [CrudModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Module({
      imports: [
        AppGlobalTest,
        CrudModule.forFeature({
          settings: {
            serialization: { toPlainOptions: { strategy: 'excludeAll' } },
          },
        }),
      ],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();

    it('settings should be overriden', async () => {
      expect(crudSettings).toEqual({
        serialization: { toPlainOptions: { strategy: 'excludeAll' } },
      });
    });
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

  describe('forFeature with controller config (uses ConfigurableCrudBuilder)', () => {
    const TEST_ENTITY_KEY = CRUD_TEST_COMPANY_ENTITY_KEY;

    let testModule: TestingModule;

    beforeAll(async () => {
      testModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(ormSqliteConfig),
          TypeOrmExtModule.forFeature({
            [TEST_ENTITY_KEY]: {
              entity: CompanyEntity,
            },
          }),
          CrudModule.forRoot({}),
          CrudModule.forFeature({
            cruds: {
              [TEST_ENTITY_KEY]: {
                entity: CompanyEntity,
                adapter: TypeOrmCrudAdapter,
                controller: {
                  path: 'companies',
                  model: { type: CompanyEntity },
                },
              },
            },
          }),
        ],
      }).compile();

      setProviderVars(testModule);
    });

    afterAll(async () => {
      await testModule?.close();
    });

    commonProviderTests();

    it('should create adapter provider', () => {
      const adapter = testModule.get(
        getDynamicCrudAdapterToken(TEST_ENTITY_KEY),
      );
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(TypeOrmCrudAdapter);
    });

    it('should create service provider', () => {
      const adapter = testModule.get(
        getDynamicCrudAdapterToken(TEST_ENTITY_KEY),
      );
      const service = testModule.get<CrudService<CompanyEntity>>(
        getDynamicCrudServiceToken(TEST_ENTITY_KEY),
      );
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CrudService);
      expect(service['crudAdapter']).toEqual(adapter);
    });
  });

  describe('forFeature with custom service class', () => {
    const TEST_ENTITY_KEY = CRUD_TEST_COMPANY_ENTITY_KEY;

    @Injectable()
    class CustomCompanyService extends CrudService<CompanyEntity> {
      constructor(
        @InjectDynamicCrudAdapter(TEST_ENTITY_KEY)
        crudAdapter: CrudAdapter<CompanyEntity>,
      ) {
        super(crudAdapter);
      }

      customMethod(): string {
        return 'custom';
      }
    }

    let testModule: TestingModule;

    beforeAll(async () => {
      testModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(ormSqliteConfig),
          TypeOrmExtModule.forFeature({
            [TEST_ENTITY_KEY]: {
              entity: CompanyEntity,
            },
          }),
          CrudModule.forRoot({}),
          CrudModule.forFeature({
            cruds: {
              [TEST_ENTITY_KEY]: {
                entity: CompanyEntity,
                adapter: TypeOrmCrudAdapter,
                service: CustomCompanyService,
                controller: {
                  path: 'companies',
                  model: { type: CompanyEntity },
                },
              },
            },
          }),
        ],
      }).compile();

      setProviderVars(testModule);
    });

    afterAll(async () => {
      await testModule?.close();
    });

    commonProviderTests();

    it('should create adapter provider', () => {
      const adapter = testModule.get(
        getDynamicCrudAdapterToken(TEST_ENTITY_KEY),
      );
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(TypeOrmCrudAdapter);
    });

    it('should use custom service class', () => {
      const service = testModule.get<CustomCompanyService>(
        getDynamicCrudServiceToken(TEST_ENTITY_KEY),
      );
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CustomCompanyService);
      expect(service.customMethod()).toBe('custom');
    });
  });

  describe('forFeature with custom controller class', () => {
    const TEST_ENTITY_KEY = CRUD_TEST_COMPANY_ENTITY_KEY;

    @Controller('companies')
    class CustomCompanyController {
      @Get('ping')
      ping(): string {
        return 'pong';
      }
    }

    let testModule: TestingModule;

    beforeAll(async () => {
      testModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(ormSqliteConfig),
          TypeOrmExtModule.forFeature({
            [TEST_ENTITY_KEY]: {
              entity: CompanyEntity,
            },
          }),
          CrudModule.forRoot({}),
          CrudModule.forFeature({
            cruds: {
              [TEST_ENTITY_KEY]: {
                entity: CompanyEntity,
                adapter: TypeOrmCrudAdapter,
                controller: CustomCompanyController,
              },
            },
          }),
        ],
      }).compile();

      setProviderVars(testModule);
    });

    afterAll(async () => {
      await testModule?.close();
    });

    commonProviderTests();

    it('should register custom controller', () => {
      const controller = testModule.get(CustomCompanyController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CustomCompanyController);
      expect(controller.ping()).toBe('pong');
    });
  });

  describe('forFeature with self-contained service (no adapter)', () => {
    const TEST_ENTITY_KEY = 'SELF_CONTAINED_TEST';

    @Injectable()
    class SelfContainedService extends CrudService<CompanyEntity> {
      constructor() {
        super(null as unknown as CrudAdapter<CompanyEntity>);
      }

      customMethod(): string {
        return 'self-contained';
      }
    }

    describe('service with controller config', () => {
      let testModule: TestingModule;

      beforeAll(async () => {
        testModule = await Test.createTestingModule({
          imports: [
            CrudModule.forRoot({}),
            CrudModule.forFeature({
              cruds: {
                [TEST_ENTITY_KEY]: {
                  entity: CompanyEntity,
                  service: SelfContainedService,
                  controller: {
                    path: 'self-contained',
                    model: { type: CompanyEntity },
                  },
                },
              },
            }),
          ],
        }).compile();

        setProviderVars(testModule);
      });

      afterAll(async () => {
        await testModule?.close();
      });

      commonProviderTests();

      it('should use self-contained service', () => {
        const service = testModule.get<SelfContainedService>(
          getDynamicCrudServiceToken(TEST_ENTITY_KEY),
        );
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(SelfContainedService);
        expect(service.customMethod()).toBe('self-contained');
      });
    });

    describe('service with controller class', () => {
      @Controller('self-contained')
      class SelfContainedController {
        @Get('ping')
        ping(): string {
          return 'pong';
        }
      }

      let testModule: TestingModule;

      beforeAll(async () => {
        testModule = await Test.createTestingModule({
          imports: [
            CrudModule.forRoot({}),
            CrudModule.forFeature({
              cruds: {
                [TEST_ENTITY_KEY]: {
                  entity: CompanyEntity,
                  service: SelfContainedService,
                  controller: SelfContainedController,
                },
              },
            }),
          ],
        }).compile();

        setProviderVars(testModule);
      });

      afterAll(async () => {
        await testModule?.close();
      });

      commonProviderTests();

      it('should use self-contained service', () => {
        const service = testModule.get<SelfContainedService>(
          getDynamicCrudServiceToken(TEST_ENTITY_KEY),
        );
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(SelfContainedService);
      });

      it('should register controller', () => {
        const controller = testModule.get(SelfContainedController);
        expect(controller).toBeDefined();
        expect(controller.ping()).toBe('pong');
      });
    });
  });
});
