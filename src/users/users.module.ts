import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import {
  PasswordCredential,
  PasswordCredentialSchema,
} from 'src/schemas/password-credential.schema';
import { UsersController } from './users.controller';
import { FileSystemModule } from 'src/file-system/file-system.module';
import {
  FollowingList,
  FollowingListSchema,
} from 'src/schemas/following-list.schema';
import { Followed, FollowedSchema } from 'src/schemas/followed.schema';
import { FollowsModule } from 'src/follows/follows.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PasswordCredential.name, schema: PasswordCredentialSchema },
      { name: FollowingList.name, schema: FollowingListSchema },
      { name: Followed.name, schema: FollowedSchema },
    ]),
    FileSystemModule,
    FollowsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
