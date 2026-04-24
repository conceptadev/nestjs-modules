import { firstValueFrom, isObservable } from 'rxjs';

import {
  CanActivate,
  Injectable,
  ExecutionContext,
  Inject,
} from '@nestjs/common';

import { AuthRouterGuards } from './auth-router.constants';
import { AuthRouterGuardsRecord } from './auth-router.types';
import { AuthRouterAuthenticationFailedException } from './exceptions/auth-router-authentication-failed.exception';
import { AuthRouterConfigNotAvailableException } from './exceptions/auth-router-config-not-available.exception';
import { AuthRouterGuardInvalidException } from './exceptions/auth-router-guard-invalid.exception';
import { AuthRouterProviderMissingException } from './exceptions/auth-router-provider-missing.exception';
import { AuthRouterProviderNotSupportedException } from './exceptions/auth-router-provider-not-supported.exception';
import { AuthRouterException } from './exceptions/auth-router.exception';

/**
 * Auth Router
 *
 * This guard is responsible for handling Auth Router authentication by delegating
 * to provider-specific guards based on the 'provider' query parameter.
 */
@Injectable()
export class AuthRouterGuard implements CanActivate {
  constructor(
    @Inject(AuthRouterGuards)
    private readonly allAuthRouterGuards: AuthRouterGuardsRecord,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawProvider = request.query?.provider;
    const rawCode = request.query?.code;
    const rawState = request.query?.state;
    const provider = typeof rawProvider === 'string' ? rawProvider : undefined;
    const code = typeof rawCode === 'string' ? rawCode : undefined;
    const state = typeof rawState === 'string' ? rawState : undefined;

    // Handle callback case (when code is present)
    if (code) {
      const callbackProvider = provider ?? this.extractProviderFromState(state);

      if (!callbackProvider) {
        throw new AuthRouterProviderMissingException();
      }

      return this.executeProviderGuard(callbackProvider.trim(), context);
    }

    // Handle initial authorization request
    if (!provider) {
      throw new AuthRouterProviderMissingException();
    }

    const trimmedProvider = provider.trim();
    if (!trimmedProvider) {
      throw new AuthRouterProviderMissingException();
    }

    return this.executeProviderGuard(trimmedProvider, context);
  }

  private async executeProviderGuard(
    provider: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      if (
        !this.allAuthRouterGuards ||
        typeof this.allAuthRouterGuards !== 'object'
      ) {
        throw new AuthRouterConfigNotAvailableException();
      }

      const guardInstance = this.getProviderGuard(provider);
      const result = guardInstance.canActivate(context);

      // Handle Observable, Promise, or boolean return types
      if (isObservable(result)) {
        const observableResult = await firstValueFrom(result);
        return Boolean(observableResult);
      } else if (result instanceof Promise) {
        const promiseResult = await result;
        return Boolean(promiseResult);
      } else {
        return Boolean(result);
      }
    } catch (error) {
      // Re-throw our custom Auth Router exceptions
      if (error instanceof AuthRouterException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AuthRouterAuthenticationFailedException(provider, errorMessage);
    }
  }

  private extractProviderFromState(
    state: string | undefined,
  ): string | undefined {
    if (!state) {
      return undefined;
    }
    try {
      const stateData = JSON.parse(state) as Record<string, unknown>;
      return typeof stateData.provider === 'string'
        ? stateData.provider
        : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get the guard instance for the given provider.
   * Similar to CacheService.getAssignmentRepo()
   *
   * @param provider - The Auth Router provider name
   */
  protected getProviderGuard(provider: string): CanActivate {
    // Get the guard instance from the injected guards record
    const guardInstance = this.allAuthRouterGuards[provider];

    if (!guardInstance) {
      throw new AuthRouterProviderNotSupportedException(provider);
    }

    if (typeof guardInstance.canActivate !== 'function') {
      throw new AuthRouterGuardInvalidException(provider);
    }

    return guardInstance;
  }
}
