import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from "../constants/jwt.constants";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies['refreshToken'];
        },
      ]),
      secretOrKey: jwtConstants.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const refreshToken = req.cookies['refreshToken'];
    const userId = payload.sub;
    const isRefreshTokenValid = await this.authService.verifyRefreshToken(userId, refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { 
      id: userId,
      username: payload.username,
      displayName: payload.displayName,   
      refreshToken
    };
  }
}