import { Types } from 'mongoose';
import { ComicStatus } from 'src/shared/schemas/comic.schema';

export class UpdateComicDto {
  title?: string;
  cover?: Types.ObjectId;
  categories?: Types.ObjectId[];
  status?: ComicStatus;
}
