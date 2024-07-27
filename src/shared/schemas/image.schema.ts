import mongoose, { Types } from 'mongoose';
import { SoftDeleteDocument } from 'mongoose-delete';
const MongooseDelete = require('mongoose-delete');

export interface Image extends SoftDeleteDocument {
  _id: Types.ObjectId;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new mongoose.Schema<Image>(
  {
    url: { type: String },
  },
  {
    timestamps: true,
  },
);
ImageSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

export { ImageSchema };
