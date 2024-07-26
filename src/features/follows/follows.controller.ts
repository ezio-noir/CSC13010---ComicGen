import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Types } from 'mongoose';
import { AlreadyFollowedError } from './error/already-followed.error';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { IdentityNotMatchError } from 'src/common/errors/identity-not-match.error';
import { NotFollowedError } from './error/not-followed.error';
import { FollowingListNotExistError } from './error/following-list-not-exist.error';
import { FollowedNotExistError } from './error/followed-not-exist.error';
import { QueryDto } from 'src/common/dto/pagination-query.dto';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor(private followsService: FollowsService) {}

  @UseGuards(AccessTokenGuard)
  @Get(':userId/following')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFollowingUsers(
    @Req() req,
    @Param('userId', HexStrToMongoOIDTransformPipe) userId,
    @Query() queryDto: QueryDto,
  ) {
    try {
      const followingList = await this.followsService.getFollowings(
        userId,
        queryDto,
      );
      return {
        data: followingList,
      };
    } catch (err) {
      this.logger.error(err.message);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get(':userId/followed')
  async getFollowerCount(
    @Param('userId', HexStrToMongoOIDTransformPipe) userId,
  ) {
    try {
      return await this.followsService.getFollowerCount(userId);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
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
        throw new IdentityNotMatchError();
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
      } else if (err instanceof IdentityNotMatchError) {
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
