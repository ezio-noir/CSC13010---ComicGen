import mongoose, { InferSchemaType, Types } from 'mongoose';

export const FollowingListSchema = new mongoose.Schema({
  followingUsers: { type: [{ type: Types.ObjectId, ref: 'User' }] },
});

export type FollowingList = InferSchemaType<typeof FollowingListSchema>;
