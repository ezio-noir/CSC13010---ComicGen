import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from "../constants/jwt.constants";
import { Request } from "express";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
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

  validate(req: Request, payload) {
    const refreshToken = req.cookies['refreshToken'];
    return { 
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,   
      refreshToken
    };
  }
}