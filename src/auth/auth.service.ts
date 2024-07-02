import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { PasswordCredential } from 'src/schemas/password-credential.schema';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { RefreshToken } from 'src/schemas/refresh-token.schema';
import { filter } from 'rxjs';

export interface TokenPayload {
  sub: string,
  username: string,
  displayName?: string,
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(PasswordCredential.name) private passwordCredentialModel: mongoose.Model<PasswordCredential>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: mongoose.Model<RefreshToken>,
  ) {}

  async validateUser(username: string, password: string) {
    const credential = await this.passwordCredentialModel.findOne({ username });
    if (!credential) {
      return false;
    }
    const isPasswordValid = await bcrypt.compare(password, credential.hashedPassword);
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
    const user = await this.userService.getUserByUsername(username);
    return {
      id: user._id,
      username: username,
      displayName: user.displayName,
    }
  }

  async issueTokens(user) {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, { secret: jwtConstants.accessTokenSecret, expiresIn: jwtConstants.accessTokenExpiration }),
      refreshToken: await this.jwtService.signAsync(payload, { secret: jwtConstants.refreshTokenSecret, expiresIn: jwtConstants.refreshTokenExpiration }),
    };
  }

  async updateRefreshToken(userId: string | Types.ObjectId, refreshToken: string) {
    const saltRounds = 10;
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    const userIdAsObjectId = new mongoose.Types.ObjectId(userId);
    await this.refreshTokenModel.findOneAndUpdate(
      { userId: userIdAsObjectId },
      { userId: userIdAsObjectId, hashedRefreshToken },
      { upsert: true }
    )
  }

  async refreshAccessToken(user: TokenPayload) {

  }
}
