import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { SoftDeleteDocument } from 'mongoose-delete';
const MongooseDelete = require('mongoose-delete');

export enum ComicStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  DROPPED = 'DROPPED',
  FINISHED = 'FINISHED',
  UNKNOWN = 'UNKNOWN',
}

export interface Comic extends SoftDeleteDocument {
  _id: Types.ObjectId;
  title: string;
  author: Types.ObjectId;
  cover: string;
  status: ComicStatus;
  categories: Types.ObjectId[];
}

const ComicSchema = new mongoose.Schema<Comic>({
  title: { type: String },
  author: { type: 'ObjectId', ref: 'User' },
  cover: { type: String, required: false },
  status: {
    type: String,
    enum: Object.values(ComicStatus),
    default: ComicStatus.DRAFT,
  },
  categories: { type: ['ObjectId'], default: [] },
});

// @Schema({
//   timestamps: true,
//   toJSON: {
//     versionKey: false,
//   },
// })
// export class Comic {
//   @Prop()
//   title: string;

//   @Prop({ type: Types.ObjectId, ref: 'User' })
//   author: Types.ObjectId;

//   @Prop({ enum: ComicStatus, default: ComicStatus.DRAFT })
//   status: ComicStatus;

//   @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
//   categories: Types.ObjectId[];
// }

// const ComicSchema = SchemaFactory.createForClass(Comic);
ComicSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

export { ComicSchema };
