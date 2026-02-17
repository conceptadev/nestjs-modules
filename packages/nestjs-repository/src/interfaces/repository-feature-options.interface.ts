import { RepositoryModuleInterface } from './repository-module.interface';
import { RepositoryProviderOptions } from './repository-provider-options.interface';

/**
 * Feature module options for RepositoryModule.forFeature()
 */
export interface RepositoryFeatureOptions {
  /**
   * Repository module class with static forFeature method.
   * e.g., TypeOrmRepositoryModule
   */
  module: RepositoryModuleInterface;

  /**
   * Entity registrations.
   */
  entities: RepositoryProviderOptions[];
}
