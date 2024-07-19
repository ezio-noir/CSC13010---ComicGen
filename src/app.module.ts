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
import { ConfigModule } from '@nestjs/config';
import { ComicsModule } from './comics/comics.module';
import { CategoriesModule } from './categories/categories.module';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    SharedModule,
    FileSystemModule,
    FollowsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ComicsModule,
    CategoriesModule,
    JwtModule.register({ global: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}
