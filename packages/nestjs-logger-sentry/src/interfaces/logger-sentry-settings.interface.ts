import { SeverityLevel } from '@sentry/types';

import {
  LoggerSettingsInterface,
  LoggerTransportSettingsInterface,
} from '@concepta/nestjs-logger';

import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';

/**
 * LoggerSentry options interface.
 */
export interface LoggerSentrySettingsInterface
  extends
    Partial<Pick<LoggerSettingsInterface, 'logLevel'>>,
    LoggerTransportSettingsInterface<SeverityLevel> {
  /**
   *
   * @param transportConfig - The Sentry configuration
   */
  transportConfig: LoggerSentryConfigInterface;
}
