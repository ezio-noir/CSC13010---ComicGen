import mongoose, { InferSchemaType, Types } from 'mongoose';
const MongooseDelete = require('mongoose-delete');

const ChapterSchema = new mongoose.Schema(
  {
    chapterNumber: { type: Number },
    title: { type: String },
    pages: { type: [{ type: Types.ObjectId, ref: 'Page' }] },
  },
  { timestamps: { createdAt: 'release' } },
);
ChapterSchema.plugin(MongooseDelete);

export type Chapter = InferSchemaType<typeof ChapterSchema>;

export { ChapterSchema };
