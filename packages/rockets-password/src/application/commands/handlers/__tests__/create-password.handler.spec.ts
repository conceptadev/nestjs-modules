import { PasswordStorageInterface } from '../../../../domain/password/interfaces/password-storage.interface';
import { CreatePasswordCommand } from '../../impl/create-password.command';
import { CreatePasswordHandler } from '../create-password.handler';

import { createMockCreationService } from './mock.helpers';

describe(CreatePasswordHandler.name, () => {
  it('should delegate to PasswordCreationService.create', async () => {
    const creationService = createMockCreationService();
    const handler = new CreatePasswordHandler(creationService);
    const result: PasswordStorageInterface = { passwordHash: 'hashed' };
    creationService.create.mockResolvedValue(result);

    const command = new CreatePasswordCommand('my-password');
    const output = await handler.execute(command);

    expect(creationService.create).toHaveBeenCalledWith('my-password');
    expect(output).toEqual(result);
  });
});
