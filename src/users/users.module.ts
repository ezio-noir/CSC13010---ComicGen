import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PasswordCredential, PasswordCredentialSchema } from 'src/schemas/password-credential.schema';
import { UserController } from './users.controller';
import { FileSystemModule } from 'src/file-system/file-system.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: PasswordCredential.name,
        schema: PasswordCredentialSchema,
      },
    ]),
    FileSystemModule,
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
