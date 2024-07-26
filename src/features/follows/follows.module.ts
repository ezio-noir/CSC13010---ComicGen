import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FollowingList,
  FollowingListSchema,
} from 'src/shared/schemas/following-list.schema';
import { UserSchema } from 'src/shared/schemas/user.schema';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Followed, FollowedSchema } from 'src/shared/schemas/followed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'FollowingList', schema: FollowingListSchema },
      { name: Followed.name, schema: FollowedSchema },
    ]),
  ],
  providers: [FollowsService],
  exports: [FollowsService],
  controllers: [FollowsController],
})
export class FollowsModule {}
