import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Query,
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
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { HexStrToMongoOIDTransformPipe } from 'src/shared/pipe/hex-str-to-mongo-oid-transform';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor(private followsService: FollowsService) {}

  @UseGuards(AccessTokenGuard)
  @Get(':userId/following')
  async getFollowingUsers(
    @Req() req,
    @Param('userId') userId,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    try {
      await this.followsService.getFollowings(
        Types.ObjectId.createFromHexString(userId),
        paginationQuery,
      );
    } catch (err) {
      console.log(err);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':userId')
  async followUser(
    @Req() req,
    @Param('userId', HexStrToMongoOIDTransformPipe) sourceUserId,
    @Body('targetUserId', HexStrToMongoOIDTransformPipe) targetUserId,
    @Body('follow') follow: boolean,
  ) {
    try {
      const extractedSourceUserId = Types.ObjectId.createFromHexString(
        req.user.id,
      );
      if (!extractedSourceUserId.equals(sourceUserId))
        throw new IdentityNotMatch();
      if (follow) {
        await this.followsService.setFollow(sourceUserId, targetUserId);
        return {
          message: 'Follow set successfully.',
        };
      } else {
        await this.followsService.unsetFollow(sourceUserId, targetUserId);
        return {
          message: 'Follow unset successfully.',
        };
      }
    } catch (err) {
      this.logger.error(err.message);
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
