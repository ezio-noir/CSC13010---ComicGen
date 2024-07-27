import mongoose, { InferSchemaType, Types } from 'mongoose';
const MongooseDelete = require('mongoose-delete');

const RawResourceSchema = new mongoose.Schema(
  {
    owner: { type: Types.ObjectId, ref: 'User' },
    url: { type: String },
  },
  {
    timestamps: {
      createdAt: true,
    },
  },
);
RawResourceSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

export type RawResource = InferSchemaType<typeof RawResourceSchema>;
export { RawResourceSchema };
