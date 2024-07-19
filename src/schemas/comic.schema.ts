import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
const MongooseDelete = require('mongoose-delete');

export enum ComicStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  DROPPED = 'DROPPED',
  FINISHED = 'FINISHED',
  UNKNOWN = 'UNKNOWN',
}

@Schema({
  timestamps: true,
  toJSON: {
    versionKey: false,
  },
})
export class Comic {
  @Prop()
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ enum: ComicStatus, default: ComicStatus.DRAFT })
  status: ComicStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];
}

const ComicSchema = SchemaFactory.createForClass(Comic);
ComicSchema.plugin(MongooseDelete, { deletedAt: true });

export { ComicSchema };
