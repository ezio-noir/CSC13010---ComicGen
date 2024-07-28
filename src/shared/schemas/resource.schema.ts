import mongoose, { InferSchemaType, Types } from 'mongoose';
const MongooseDelete = require('mongoose-delete');

export enum ResourceAccess {
  PUBLIC = 'PUBLIC',
  OWNER = 'OWNER',
}

const ResourceSchema = new mongoose.Schema(
  {
    owner: { type: Types.ObjectId, ref: 'User' },
    access: { type: String, enum: Object.values(ResourceAccess) },
    url: { type: String },
  },
  {
    timestamps: {
      createdAt: true,
    },
  },
);
ResourceSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

export type Resource = InferSchemaType<typeof ResourceSchema>;
export { ResourceSchema };
