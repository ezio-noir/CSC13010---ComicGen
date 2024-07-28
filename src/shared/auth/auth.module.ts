import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/features/users/users.module';
import { FileSystemModule } from 'src/shared/file-system/file-system.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/shared/schemas/refresh-token.schema';
import {
  PasswordCredential,
  PasswordCredentialSchema,
} from 'src/shared/schemas/password-credential.schema';
import { RoleGuard } from './guards/roles.guard';
import { StorageModule } from 'src/shared/storage/storage.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    StorageModule,
    UsersModule,
    FileSystemModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({}),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: PasswordCredential.name,
        schema: PasswordCredentialSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RoleGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
