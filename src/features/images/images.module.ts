import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RawResourceSchema } from 'src/shared/schemas/raw-resource.schema';
import { StorageModule } from 'src/shared/storage/storage.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RawResource', schema: RawResourceSchema },
    ]),
    StorageModule,
    UsersModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
