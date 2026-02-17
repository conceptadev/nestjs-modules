import { Expose } from 'class-transformer';

export class ProjectDto {
  @Expose()
  id?: number;

  @Expose()
  name?: string;

  @Expose()
  description?: string;

  @Expose()
  isActive?: boolean;

  @Expose()
  companyId?: number;
}
