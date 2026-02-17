import { Module, DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getDynamicRepositoryToken } from '@concepta/nestjs-common';

import { RepositoryDuplicateKeyException } from '../exceptions/repository-duplicate-key.exception';
import { RepositoryModule } from '../repository.module';

// Mock entity classes
class UserEntity {}
class OrderEntity {}
class DuplicateUserEntity {}

// Mock repository module that provides adapter tokens
@Module({})
class MockRepositoryModule {
  static forFeature(
    entities: { key: string; entity: { name: string } }[],
  ): DynamicModule {
    return {
      module: MockRepositoryModule,
      providers: entities.map((e) => ({
        provide: getDynamicRepositoryToken(e.key),
        useValue: { entity: e.entity, entityName: () => e.entity.name },
      })),
      exports: entities.map((e) => getDynamicRepositoryToken(e.key)),
    };
  }
}

describe('RepositoryRegistryService', () => {
  it('should allow unique keys', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: MockRepositoryModule,
          entities: [
            { key: 'users', entity: UserEntity },
            { key: 'orders', entity: OrderEntity },
          ],
        }),
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    // Should not throw - unique keys are allowed
    await expect(app.init()).resolves.not.toThrow();

    await app.close();
  });

  it('should throw on duplicate keys at bootstrap', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: MockRepositoryModule,
          entities: [{ key: 'users', entity: UserEntity }],
        }),
        RepositoryModule.forFeature({
          module: MockRepositoryModule,
          entities: [{ key: 'users', entity: DuplicateUserEntity }],
        }),
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    await expect(app.init()).rejects.toThrow(RepositoryDuplicateKeyException);

    await app.close();
  });

  it('should isolate registrations between test runs', async () => {
    // This test verifies that static state doesn't leak
    // by registering the same key that was used in the first test
    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: MockRepositoryModule,
          entities: [{ key: 'users', entity: UserEntity }],
        }),
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    // Should not throw - each test gets fresh registry
    await expect(app.init()).resolves.not.toThrow();

    await app.close();
  });
});
