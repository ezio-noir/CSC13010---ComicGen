import mongoose, { InferSchemaType, Types } from 'mongoose';

const ComicChaptersSchema = new mongoose.Schema({
  chapters: { type: [{ type: Types.ObjectId, ref: 'Chapter' }] },
});

export type ComicChapters = InferSchemaType<typeof ComicChaptersSchema>;
export { ComicChaptersSchema };
