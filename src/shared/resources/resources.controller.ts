import {
  Controller,
  Get,
  Logger,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';
import { Types } from 'mongoose';
import { Response } from 'express';

@Controller('resources')
export class ResourcesController {
  private readonly logger = new Logger(ResourcesController.name);

  constructor(private readonly resourcesService: ResourcesService) {}

  @Get(':resourceId')
  @UseGuards(AccessTokenGuard)
  async getResource(
    @Req() req,
    @Param('resourceId', HexStrToMongoOIDTransformPipe)
    resourceId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const userId = Types.ObjectId.createFromHexString(req.user.id);
      const file = await this.resourcesService.getResource(userId, resourceId);
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Length', file.contentLength);
      file.stream.pipe(res);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
