import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
    },
  },
})
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  comicCount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
