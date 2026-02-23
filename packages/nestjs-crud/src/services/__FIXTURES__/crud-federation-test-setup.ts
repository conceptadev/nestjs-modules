import { mock } from 'jest-mock-extended';

import {
  CallHandler,
  ExecutionContext,
  PlainLiteralObject,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';

import { getAppContext, Operation } from '@concepta/nestjs-common';

import { CrudContextInterceptor } from '../../infrastructure/interceptors/crud-context.interceptor';
import { CrudContextInterface } from '../../infrastructure/interceptors/interfaces/crud-context.interface';
import { QueryRelation } from '../../infrastructure/request/crud-query.types';
import { CrudOptionsInterface } from '../../infrastructure/request/interfaces/crud-options.interface';
import { CrudResolverInterface } from '../../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { CrudFederationService } from '../../infrastructure/services/crud-federation.service';
import { CrudLocalResolverService } from '../../infrastructure/services/crud-local-resolver.service';
import { CrudMetaview } from '../../infrastructure/services/crud-metaview.service';

import {
  TestRoot,
  TestRelation,
  createTestRelations,
} from './crud-federation-test-entities';

// Request object interface for interceptor testing
interface MockRequest {
  query: PlainLiteralObject;
  params?: PlainLiteralObject;
}

// Handler spy interface for type safety
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerSpy = jest.SpyInstance<any, any[]>;

export interface CrudFederationTestMocks {
  service: CrudFederationService<TestRoot, TestRelation[]>;
  interceptor: CrudContextInterceptor<TestRoot>;
  module: TestingModule;
  resolver: CrudResolverInterface;
  // Handler spies for asserting calls and setting responses
  rootListSpy: HandlerSpy;
  rootReadSpy: HandlerSpy;
  relationListSpy: HandlerSpy;
  relationReadSpy: HandlerSpy;
  profileListSpy: HandlerSpy;
  settingsListSpy: HandlerSpy;
  resetAllMocks: () => void;
  applyInterceptorTransform: (
    query: PlainLiteralObject,
    options?: Partial<CrudOptionsInterface<TestRoot>>,
    operation?: Operation,
  ) => Promise<CrudContextInterface<TestRoot>>;
  createTestQuery: (
    query?: PlainLiteralObject,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relations?: QueryRelation<TestRoot, any>[],
  ) => Promise<CrudContextInterface<TestRoot>>;
}

export const setupCrudFederationTests =
  async (): Promise<CrudFederationTestMocks> => {
    // Create mock resolver with spies for each entity type
    const mockResolver = mock<CrudResolverInterface>();

    // Create spies for list/read operations by entity
    const rootListSpy = jest.fn();
    const rootReadSpy = jest.fn();
    const relationListSpy = jest.fn();
    const relationReadSpy = jest.fn();
    const profileListSpy = jest.fn();
    const settingsListSpy = jest.fn();

    // Set default responses
    rootListSpy.mockResolvedValue({
      data: [
        { id: 1, name: 'Root 1' },
        { id: 2, name: 'Root 2' },
      ],
      total: 2,
      count: 2,
    });
    rootReadSpy.mockResolvedValue({ id: 1, name: 'Root 1' });
    relationListSpy.mockResolvedValue({
      data: [
        { id: 1, rootId: 1, title: 'Relation 1' },
        { id: 2, rootId: 2, title: 'Relation 2' },
      ],
      total: 2,
      count: 2,
    });
    profileListSpy.mockResolvedValue({
      data: [
        { id: 1, rootId: 1, bio: 'Profile for Root 1', avatar: 'avatar1.jpg' },
      ],
      total: 1,
      count: 1,
    });
    settingsListSpy.mockResolvedValue({
      data: [{ id: 1, rootId: 1, theme: 'dark', notifications: true }],
      total: 1,
      count: 1,
    });

    // Route resolver calls based on context.entity
    mockResolver.list.mockImplementation((context) => {
      switch (context.entity) {
        case 'TestRoot':
          return rootListSpy(context);
        case 'TestRelation':
          return relationListSpy(context);
        case 'TestProfile':
          return profileListSpy(context);
        case 'TestSettings':
          return settingsListSpy(context);
        default:
          throw new Error(`Unknown entity: ${context.entity}`);
      }
    });

    mockResolver.read.mockImplementation((context) => {
      switch (context.entity) {
        case 'TestRoot':
          return rootReadSpy(context);
        case 'TestRelation':
          return relationReadSpy(context);
        default:
          throw new Error(`Unknown entity for read: ${context.entity}`);
      }
    });

    // Create module (minimal - just for TestingModule interface)
    const module = await Test.createTestingModule({
      providers: [],
    }).compile();

    await module.init();

    // Create interceptor with mocked services
    const mockReflectionService = mock<CrudMetaview<TestRoot>>();
    const mockLocalResolverService = mock<CrudLocalResolverService>();
    // Configure mock to resolve (no CrudLocal resolvers in tests)
    mockLocalResolverService.resolve.mockResolvedValue(undefined);
    const interceptor = new CrudContextInterceptor<TestRoot>(
      mockReflectionService,
      mockLocalResolverService,
    );

    // Create service with mock resolver
    const service = new CrudFederationService<TestRoot, TestRelation[]>(
      mockResolver,
      'TestRoot',
    );

    const resetAllMocks = () => {
      // mockClear() clears call history but keeps implementation
      rootListSpy.mockClear();
      rootReadSpy.mockClear();
      relationListSpy.mockClear();
      relationReadSpy.mockClear();
      profileListSpy.mockClear();
      settingsListSpy.mockClear();
    };

    const applyInterceptorTransform = async (
      query: PlainLiteralObject,
      options: Partial<CrudOptionsInterface<TestRoot>> = {},
      operation: Operation = Operation.List,
    ): Promise<CrudContextInterface<TestRoot>> => {
      // Create request object that interceptor will mutate
      const req: MockRequest = { query };

      // Mock reflection service returns
      mockReflectionService.getContextOptions.mockReturnValue({
        ...options,
      });
      mockReflectionService.getOperation.mockReturnValue(operation);
      mockReflectionService.getEntity.mockReturnValue('TestRoot');
      mockReflectionService.getLocals.mockReturnValue([]);

      // Mock execution context
      const mockContext = mock<ExecutionContext>();
      const mockHttpContext = mock<HttpArgumentsHost>();
      mockHttpContext.getRequest.mockReturnValue(req);
      mockContext.switchToHttp.mockReturnValue(mockHttpContext);

      // Execute interceptor - it will mutate req
      await interceptor.intercept(mockContext, mock<CallHandler>());

      // Return the transformed context from the request
      return getAppContext<CrudContextInterface<TestRoot>>(req);
    };

    const createTestQuery = async (
      query?: PlainLiteralObject,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relations: QueryRelation<TestRoot, any>[] = [],
    ): Promise<CrudContextInterface<TestRoot>> => {
      const options: Partial<CrudOptionsInterface<TestRoot>> = {};

      // Add relations if provided
      if (relations.length > 0) {
        options.query = {
          relations: createTestRelations(relations),
        };
      }

      return applyInterceptorTransform(query || {}, options);
    };

    return {
      service,
      interceptor,
      module,
      resolver: mockResolver,
      rootListSpy,
      rootReadSpy,
      relationListSpy,
      relationReadSpy,
      profileListSpy,
      settingsListSpy,
      resetAllMocks,
      applyInterceptorTransform,
      createTestQuery,
    };
  };

export const cleanupCrudFederationTests = async (
  mocks: CrudFederationTestMocks,
): Promise<void> => {
  // Reset mocks to prepare for next test
  mocks.resetAllMocks();
  await mocks.module.close();
};
