import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RawResourceSchema } from '../schemas/raw-resource.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'RawResource', schema: RawResourceSchema },
    ]),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
