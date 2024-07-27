import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { ImagesService } from './images.service';
import { StorageService } from 'src/shared/storage/storage.service';
import { Response } from 'express';

@Controller('images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(
    private readonly imagesService: ImagesService,
    private readonly storageService: StorageService,
  ) {}

  @Get('avatar')
  async getAvatar(@Query('url') url: string, @Res() res: Response) {
    try {
      const file = await this.storageService.getFileFromBucket(url);
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Length', file.contentLength);
      file.stream.pipe(res);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
