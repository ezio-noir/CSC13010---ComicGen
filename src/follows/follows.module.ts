import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FollowingList,
  FollowingListSchema,
} from 'src/schemas/following-list.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Followed, FollowedSchema } from 'src/schemas/followed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FollowingList.name, schema: FollowingListSchema },
      { name: Followed.name, schema: FollowedSchema },
    ]),
  ],
  providers: [FollowsService],
  exports: [FollowsService],
  controllers: [FollowsController],
})
export class FollowsModule {}
