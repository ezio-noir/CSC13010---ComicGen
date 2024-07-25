import { Types } from 'mongoose';
import { ComicStatus } from 'src/shared/schemas/comic.schema';

export class UpdateComicDto {
  title?: string;
  cover?: string;
  categories?: Types.ObjectId[];
  status?: ComicStatus;
}
