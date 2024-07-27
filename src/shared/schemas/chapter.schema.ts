import mongoose, { InferSchemaType, Types } from 'mongoose';
const MongooseDelete = require('mongoose-delete');

const ChapterSchema = new mongoose.Schema(
  {
    comic: { type: Types.ObjectId, ref: 'Comic' },
    chapterNumber: { type: Number },
    title: { type: String },
    pages: {
      type: [
        new mongoose.Schema({
          pageNumber: { type: Number },
          url: { type: String },
        }),
      ],
    },
  },
  { timestamps: { createdAt: 'release' } },
);
ChapterSchema.plugin(MongooseDelete);

export type Chapter = InferSchemaType<typeof ChapterSchema>;

export { ChapterSchema };
