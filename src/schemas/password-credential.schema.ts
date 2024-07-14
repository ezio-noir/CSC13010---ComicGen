import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PasswordCredential {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  hashedPassword: string;
}

export const PasswordCredentialSchema =
  SchemaFactory.createForClass(PasswordCredential);
