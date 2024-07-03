import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { FileSystemModule } from './file-system/file-system.module';

@Module({
  imports: [AuthModule, DatabaseModule, UserModule, SharedModule, FileSystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
