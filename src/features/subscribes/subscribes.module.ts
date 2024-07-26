import { Module } from '@nestjs/common';
import { SubscribesService } from './subscribes.service';
import { SubscribesController } from './subscribes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/shared/schemas/user.schema';
import { ComicSchema } from 'src/shared/schemas/comic.schema';
import { SubscribeListSchema } from 'src/shared/schemas/subscribe-list.schema';
import { ComicStatisticsSchema } from 'src/shared/schemas/comic-statistics.schema';
import { AuthModule } from 'src/shared/auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'SubscribeList', schema: SubscribeListSchema },
      { name: 'Comic', schema: ComicSchema },
      { name: 'ComicStatistics', schema: ComicStatisticsSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SubscribesController],
  providers: [SubscribesService],
})
export class SubscribesModule {}
