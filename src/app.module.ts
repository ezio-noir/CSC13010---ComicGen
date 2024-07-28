import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './shared/auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { UsersModule } from './features/users/users.module';
import { FileSystemModule } from './shared/file-system/file-system.module';
import { FollowsModule } from './features/follows/follows.module';
import { ApiLoggingMiddleware } from './middlewares/api-logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { ComicsModule } from './features/comics/comics.module';
import { CategoriesModule } from './features/categories/categories.module';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './shared/storage/storage.module';
import { SubscribesModule } from './features/subscribes/subscribes.module';
import { ChaptersModule } from './features/chapters/chapters.module';
import { ProjectsModule } from './features/projects/projects.module';
import { ResourcesModule } from './shared/resources/resources.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    FileSystemModule,
    FollowsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ComicsModule,
    CategoriesModule,
    JwtModule.register({ global: true }),
    StorageModule,
    SubscribesModule,
    ChaptersModule,
    ProjectsModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}
