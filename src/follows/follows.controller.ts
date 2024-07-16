import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Types } from 'mongoose';
import { AlreadyFollowedError } from './error/already-followed.error';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { IdentityNotMatch } from 'src/shared/error/identity-not-match.error';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor(private followsService: FollowsService) {}

  @UseGuards(AccessTokenGuard)
  @Patch(':userId')
  async followUser(
    @Req() req,
    @Param('userId') sourceUserId,
    @Body('userId') targetUserId: string,
  ) {
    try {
      const extractedSourceUserId = new Types.ObjectId(req.user.id);
      const paramsSourceUserId = new Types.ObjectId(sourceUserId);
      if (!extractedSourceUserId.equals(paramsSourceUserId))
        throw new IdentityNotMatch();
      await this.followsService.setFollow(
        paramsSourceUserId,
        new Types.ObjectId(targetUserId),
      );
      return {
        message: 'Follow set successfully.',
      };
    } catch (err) {
      this.logger.error(err.message, err.stack);
      if (err instanceof AlreadyFollowedError) {
        throw new BadRequestException('Already followed.');
      } else if (err instanceof IdentityNotMatch) {
        throw new UnauthorizedException();
      }
      throw err;
    }
  }
}
