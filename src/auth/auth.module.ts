import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/shared/shared.module';
import { FileSystemModule } from 'src/file-system/file-system.module';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/schemas/refresh-token.schema';
import {
  PasswordCredential,
  PasswordCredentialSchema,
} from 'src/schemas/password-credential.schema';
import { RoleGuard } from './guard/roles.guard';
import { UsersService } from 'src/users/users.service';

@Global()
@Module({
  imports: [
    UsersModule,
    FileSystemModule,
    SharedModule,
    JwtModule.register({}),
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
