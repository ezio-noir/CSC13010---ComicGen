import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  async getUserById(@Param('userId') userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist.');
    }
    return {
      data: {
        id: user._id,
        avatar: user.avatar,
        displayName: user.displayName,
      }
    };
  }
}
