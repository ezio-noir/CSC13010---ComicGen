import { Global, Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceSchema } from '../schemas/resource.schema';
import { StorageModule } from '../storage/storage.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Resource', schema: ResourceSchema }]),
    StorageModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
