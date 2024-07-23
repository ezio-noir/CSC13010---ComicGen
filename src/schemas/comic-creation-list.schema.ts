import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class ComicCreationList {
  @Prop()
  comicList: Types.ObjectId[];
}

const ComicCreationListSchema = SchemaFactory.createForClass(ComicCreationList);

export { ComicCreationListSchema };
