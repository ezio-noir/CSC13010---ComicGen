import mongoose, { InferSchemaType } from 'mongoose';

const ComicStatisticsSchema = new mongoose.Schema({
  commentCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  subscribeCount: { type: Number, default: 0 },
});

export type ComicStatistics = InferSchemaType<typeof ComicStatisticsSchema>;
export { ComicStatisticsSchema };
