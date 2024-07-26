import {
  Body,
  Controller,
  Logger,
  Param,
  ParseBoolPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscribesService } from './subscribes.service';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { Role } from 'src/common/enum/roles.enum';
import { RoleGuard } from 'src/shared/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';
import { Types } from 'mongoose';
import { IdentityNotMatchError } from 'src/common/errors/identity-not-match.error';

@Controller('subscribes')
export class SubscribesController {
  private readonly logger = new Logger(SubscribesController.name);

  constructor(private readonly subscribesService: SubscribesService) {}

  @Patch(':userId')
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async subscribeComic(
    @Req() req,
    @Param('userId', HexStrToMongoOIDTransformPipe) userId: Types.ObjectId,
    @Body('comicId', HexStrToMongoOIDTransformPipe) comicId: Types.ObjectId,
    @Body('subscribe', ParseBoolPipe) subscribe: boolean,
  ) {
    try {
      const extractedUserId = Types.ObjectId.createFromHexString(req.user.id);
      if (!extractedUserId.equals(userId)) throw new IdentityNotMatchError();

      if (subscribe) {
        await this.subscribesService.subscribeComic(userId, comicId);
        this.logger.log(`Subscribe set: ${userId} -> ${comicId}.`);
        return {
          message: "Comic's subscribed successfully.",
        };
      } else {
        await this.subscribesService.unsubscribeComic(userId, comicId);
        this.logger.log(`Subscribe set: ${userId} -x- ${comicId}.`);
        return {
          message: "Comic's unsubscribed successfully.",
        };
      }
    } catch (error) {
      this.logger.error(error.meesage);
      throw error;
    }
  }
}
