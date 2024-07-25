import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { PasswordCredential } from 'src/shared/schemas/password-credential.schema';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/features/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { RefreshToken } from 'src/shared/schemas/refresh-token.schema';
import { Role } from 'src/common/enum/roles.enum';

export interface TokenPayload {
  sub: string;
  username: string;
  displayName?: string;
}

@Injectable()
export class AuthService {
  private readonly rolePriorities: Record<Role, number> = {
    [Role.USER]: 0x010,
    [Role.ADMIN]: 0x100,
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(PasswordCredential.name)
    private passwordCredentialModel: mongoose.Model<PasswordCredential>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: mongoose.Model<RefreshToken>,
  ) {}

  private checkPriority(roles: string[], requiredRoles: string[]) {
    const rolesPriority = roles.map((role) => this.rolePriorities[role]);
    const requiredRolesPriority = requiredRoles.map(
      (role) => this.rolePriorities[role],
    );
    return Math.max(...rolesPriority) >= Math.min(...requiredRolesPriority);
  }

  async checkUserPrivilege(userId: Types.ObjectId, requiredRoles: string[]) {
    const userRoles = await this.usersService.getUserRoles(userId);
    return this.checkPriority(userRoles, requiredRoles);
  }

  async validateUser(username: string, password: string) {
    const credential = await this.passwordCredentialModel.findOne({ username });
    if (!credential) {
      return false;
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      credential.hashedPassword,
    );
    if (!isPasswordValid) {
      return false;
    }
    return true;
  }

  async validateAndRetrieveUser(username: string, password: string) {
    const isUserValid = await this.validateUser(username, password);
    if (!isUserValid) {
      return null;
    }
    const user = await this.usersService.getUserByUsername(username);
    return {
      id: user._id,
      username: username,
      displayName: user.displayName,
    };
  }

  async issueTokens(user) {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: jwtConstants.accessTokenExpiration,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: jwtConstants.refreshTokenExpiration,
      }),
    };
  }

  async updateRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string,
  ) {
    const saltRounds = 10;
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    const userIdAsObjectId = new mongoose.Types.ObjectId(userId);
    await this.refreshTokenModel.findOneAndUpdate(
      { userId: userIdAsObjectId },
      { userId: userIdAsObjectId, hashedRefreshToken },
      { upsert: true },
    );
  }

  async revokeRefreshToken(userId: string | Types.ObjectId) {
    const userIdAsObjectId = new mongoose.Types.ObjectId(userId);
    await this.refreshTokenModel.findOneAndUpdate(
      { userId: userIdAsObjectId },
      { hashedRefreshToken: null },
    );
  }

  async verifyRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string,
  ) {
    const token = await this.refreshTokenModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (
      token &&
      (await bcrypt.compare(refreshToken, token.hashedRefreshToken))
    ) {
      return true;
    }
    return false;
  }
}
