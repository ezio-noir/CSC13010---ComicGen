import mongoose, { InferSchemaType, Types } from 'mongoose';

const SubscribeListSchema = new mongoose.Schema(
  {
    subscribeComics: { type: [{ type: Types.ObjectId, ref: 'Comic' }] },
  },
  {
    timestamps: true,
  },
);

export type SubscribeList = InferSchemaType<typeof SubscribeListSchema>;
export { SubscribeListSchema };
