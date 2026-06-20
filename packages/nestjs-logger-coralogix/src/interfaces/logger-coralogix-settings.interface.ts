import { Severity } from 'coralogix-logger';

import {
  LoggerSettingsInterface,
  LoggerTransportSettingsInterface,
} from '@concepta/nestjs-logger';

import { LoggerCoralogixConfigInterface } from './logger-coralogix-config.interface';
/**
 * Coralogix options interface.
 */
export interface LoggerCoralogixSettingsInterface
  extends
    Partial<Pick<LoggerSettingsInterface, 'logLevel'>>,
    LoggerTransportSettingsInterface<Severity> {
  /**
   *
   * @param transportConfig - The coralogix configuration
   */
  transportConfig: LoggerCoralogixConfigInterface;
}
