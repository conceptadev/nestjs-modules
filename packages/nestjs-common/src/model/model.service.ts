import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ReferenceIdInterface } from '../reference/interfaces/reference-id.interface';
import { RepositoryFindOptions } from '../repository/interfaces/repository-options.interface';
import { RepositoryInterface } from '../repository/interfaces/repository.interface';
import { Where } from '../repository/where.helpers';
import { DeepPartial } from '../utils/deep-partial';
import { Type } from '../utils/interfaces/type.interface';

import { ModelIdNoMatchException } from './exceptions/model-id-no-match.exception';
import { ModelMutateException } from './exceptions/model-mutate.exception';
import { ModelValidationException } from './exceptions/model-validation.exception';
import { ModelServiceInterface } from './interfaces/model-service.interface';

/**
 * Abstract mutate service
 */
export abstract class ModelService<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity> & ReferenceIdInterface<Entity['id']>,
  Replaceable extends Creatable & Pick<Entity, 'id'> = Creatable &
    Pick<Entity, 'id'>,
  Removable extends Pick<Entity, 'id'> = Pick<Entity, 'id'>,
> implements
    ModelServiceInterface<Entity, Creatable, Updatable, Replaceable, Removable>
{
  protected abstract createDto: Type<Creatable>;
  protected abstract updateDto: Type<Updatable>;

  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(protected repo: RepositoryInterface<Entity>) {}

  /**
   * Find
   *
   * @param options - Find many options
   */
  async find(options?: RepositoryFindOptions<Entity>): Promise<Entity[]> {
    return this.repo.find(options);
  }

  /**
   * Get entity for the given id.
   *
   * @param id - the id
   */
  async byId(id: Entity['id']): Promise<Entity | null> {
    return this.repo.findOne({
      where: Where.eq<Entity>('id', id),
    });
  }

  /**
   * Create one
   *
   * @param data - the reference to create
   * @returns the created reference
   */
  async create(data: Creatable): Promise<Entity> {
    // validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // create new entity
    const entity = this.repo.transform(transformed);
    // try to create the entity
    try {
      return await this.repo.create(entity);
    } catch (e) {
      throw new ModelMutateException(this.repo.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * Update one
   *
   * @param data - the reference data to update
   * @returns the updated reference
   */
  async update(data: Updatable): Promise<Entity> {
    // the entity we will update
    const entity = await this.findByIdOrFail(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // try to update it
    try {
      return await this.repo.update(entity, transformed);
    } catch (e) {
      throw new ModelMutateException(this.repo.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * Replace one
   *
   * @param data - the reference data to replace
   * @returns the replaced reference
   */
  async replace(data: Replaceable): Promise<Entity> {
    // the entity we will replace
    const entity = await this.findByIdOrFail(data.id);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // try to replace it
    try {
      return await this.repo.replace(entity, transformed);
    } catch (e) {
      throw new ModelMutateException(this.repo.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * Remove one
   *
   * @param data - the reference data to remove
   * @returns the removed reference
   */
  async remove(data: Removable): Promise<Entity> {
    // try to find it
    const entity = await this.findByIdOrFail(data.id);
    // try to remove it
    return this.delete(entity);
  }

  /**
   * @internal
   */
  private async delete(entity: Entity): Promise<Entity> {
    // try to save it
    try {
      return await this.repo.delete(entity);
    } catch (e) {
      throw new ModelMutateException(this.repo.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * @internal
   */
  protected async validate<T extends DeepPartial<Entity>>(
    type: Type<T>,
    data: T,
  ): Promise<T> {
    // convert to dto
    const dto = plainToInstance(type, data);

    // validate the data
    const validationErrors = await validate(dto);

    // any errors?
    if (validationErrors?.length) {
      // yes, throw error
      throw new ModelValidationException(
        this.repo.metadata.name,
        validationErrors,
      );
    }

    return dto;
  }

  /**
   * @internal
   */
  protected async transform(
    data: DeepPartial<Entity>,
  ): Promise<DeepPartial<Entity>> {
    return data;
  }

  /**
   * @internal
   */
  protected async findByIdOrFail(id: Entity['id']): Promise<Entity> {
    // try to find the ref
    const entity = await this.byId(id);

    // did we get one?
    if (entity) {
      return entity;
    } else {
      throw new ModelIdNoMatchException(this.repo.metadata.name, id);
    }
  }
}
