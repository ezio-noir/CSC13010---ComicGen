import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Put,
  Req,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Types } from 'mongoose';
import { AlreadyFollowedError } from './error/already-followed.error';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor(private followsService: FollowsService) {}

  @Put()
  async followUser(@Req() req, @Body('userId') targetUserId: string) {
    try {
      const sourceUserId: string = req.user.id;
      await this.followsService.setFollow(
        new Types.ObjectId(sourceUserId),
        new Types.ObjectId(targetUserId),
      );
      return {
        message: 'Follow set successfully.',
      };
    } catch (err) {
      if (err instanceof AlreadyFollowedError) {
        throw new BadRequestException('Already followed.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
