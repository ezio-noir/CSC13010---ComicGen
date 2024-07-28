import mongoose, { InferSchemaType, Types } from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    file: { type: Types.ObjectId, ref: 'Resource' },
  },
  { timestamps: true },
);

export type Project = InferSchemaType<typeof ProjectSchema>;

export { ProjectSchema };
