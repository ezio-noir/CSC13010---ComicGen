import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { FileSystemModule } from './file-system/file-system.module';
import { FollowsModule } from './follows/follows.module';
import { ApiLoggingMiddleware } from './middlewares/api-logging.middleware';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    SharedModule,
    FileSystemModule,
    FollowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}
