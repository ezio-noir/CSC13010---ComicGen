import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://comicgen:comicgen@comicgendb.yfakyrg.mongodb.net/?retryWrites=true&w=majority&appName=ComicGenDB')],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
