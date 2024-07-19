import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['accessToken'];
    const decodedAccessToken = this.jwtService.decode(accessToken);

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    return (
      decodedAccessToken &&
      (await this.authService.checkUserPrivilege(
        Types.ObjectId.createFromHexString(decodedAccessToken.sub),
        requiredRoles,
      ))
    );
  }
}
