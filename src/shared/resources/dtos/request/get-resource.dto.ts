import { Types } from 'mongoose';
import { ResourceAccess } from 'src/shared/schemas/resource.schema';

export class GetResourceDto {
  url: Types.ObjectId;
  owner: ResourceAccess;
}
