import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceSchema } from '../schemas/resource.schema';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Resource', schema: ResourceSchema }]),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
