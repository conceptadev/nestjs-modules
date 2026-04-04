import { mock } from 'jest-mock-extended';

import { PasswordCreationService } from '../../../../domain/services/password-creation.service';
import { PasswordValidationService } from '../../../../domain/services/password-validation.service';

export function createMockCreationService() {
  return mock<PasswordCreationService>();
}

export function createMockValidationService() {
  return mock<PasswordValidationService>();
}
