import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Types } from 'mongoose';
import { AlreadyFollowedError } from './error/already-followed.error';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { IdentityNotMatch } from 'src/shared/error/identity-not-match.error';
import { NotFollowedError } from './error/not-followed.error';
import { FollowingListNotExistError } from './error/following-list-not-exist.error';
import { FollowedNotExistError } from './error/followed-not-exist.error';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor(private followsService: FollowsService) {}

  @UseGuards(AccessTokenGuard)
  @Patch(':userId')
  async followUser(
    @Req() req,
    @Param('userId') sourceUserId,
    @Body('targetUserId') targetUserId: string,
    @Body('follow') follow: boolean,
  ) {
    try {
      const extractedSourceUserId = Types.ObjectId.createFromHexString(
        req.user.id,
      );
      const paramSourceUserId =
        Types.ObjectId.createFromHexString(sourceUserId);
      if (!extractedSourceUserId.equals(paramSourceUserId))
        throw new IdentityNotMatch();
      if (follow) {
        await this.followsService.setFollow(
          paramSourceUserId,
          Types.ObjectId.createFromHexString(targetUserId),
        );
        return {
          message: 'Follow set successfully.',
        };
      } else {
        await this.followsService.unsetFollow(
          paramSourceUserId,
          Types.ObjectId.createFromHexString(targetUserId),
        );
        return {
          message: 'Follow unset successfully.',
        };
      }
    } catch (err) {
      this.logger.error(err.message, err.stack);
      if (
        err instanceof AlreadyFollowedError ||
        err instanceof NotFollowedError
      ) {
        throw new BadRequestException(err.name);
      } else if (err instanceof IdentityNotMatch) {
        throw new UnauthorizedException();
      } else if (
        err instanceof FollowingListNotExistError ||
        err instanceof FollowedNotExistError
      ) {
        throw new NotFoundException(err.name);
      }
      throw err;
    }
  }
}
