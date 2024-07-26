import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserSchema } from 'src/shared/schemas/user.schema';
import {
  PasswordCredential,
  PasswordCredentialSchema,
} from 'src/shared/schemas/password-credential.schema';
import { UsersController } from './users.controller';
import { FileSystemModule } from 'src/shared/file-system/file-system.module';
import { FollowingListSchema } from 'src/shared/schemas/following-list.schema';
import { Followed, FollowedSchema } from 'src/shared/schemas/followed.schema';
import { FollowsModule } from 'src/features/follows/follows.module';
import { StorageModule } from 'src/shared/storage/storage.module';
import { SubscribeListSchema } from 'src/shared/schemas/subscribe-list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: PasswordCredential.name, schema: PasswordCredentialSchema },
      { name: 'FollowingList', schema: FollowingListSchema },
      { name: Followed.name, schema: FollowedSchema },
      { name: 'SubscribeList', schema: SubscribeListSchema },
    ]),
    StorageModule,
    FileSystemModule,
    FollowsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
