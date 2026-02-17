// Module
export { HookModule } from './hook.module';

// Types
export { HookTypeInterface } from './hook.interfaces';
export type { HookMethodMetadataInterface } from './hook.interfaces';

// Constants
export type { HookMethodKeyType } from './decorators/hook-method.decorator';

// Specification
export { Spec } from './specification/spec.factory';
export { CompositeSpecification } from './specification/composite-specification';
export { AlwaysSpecification } from './specification/specifications/always.specification';
export { NeverSpecification } from './specification/specifications/never.specification';
export { AndSpecification } from './specification/specifications/and.specification';
export { OrSpecification } from './specification/specifications/or.specification';
export { NotSpecification } from './specification/specifications/not.specification';

// Services
export { HookResolverService } from './hook-resolver.service';

// Decorators
export { UseHooks } from './decorators/use-hooks.decorator';
export { Hook } from './decorators/hook.decorator';
export { Specification } from './decorators/specification.decorator';
export { createHookMethodDecorator } from './decorators/hook-method.decorator';

// Interceptors
export { HookInterceptor } from './hook.interceptor';
