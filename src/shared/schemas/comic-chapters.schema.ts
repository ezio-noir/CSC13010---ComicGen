import mongoose, { InferSchemaType, Types } from 'mongoose';

const ComicChaptersSchema = new mongoose.Schema({
  chapters: {
    type: [
      new mongoose.Schema({
        chapterNumber: Number,
        chapter: { type: Types.ObjectId, ref: 'Chapter' },
      }),
    ],
  },
});

export type ComicChapters = InferSchemaType<typeof ComicChaptersSchema>;
export { ComicChaptersSchema };
