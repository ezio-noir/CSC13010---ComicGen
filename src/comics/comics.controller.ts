import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/roles.enum';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { CreateComicDto } from './dto/request/create-comic.dto';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';

@Controller('comics')
export class ComicsController {
  private readonly logger = new Logger(ComicsController.name);

  constructor(private readonly comicsService: ComicsService) {}

  @Post()
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async createComic(@Body() createComicDto: CreateComicDto) {
    try {
      const newComic = await this.comicsService.createComic(createComicDto);
      return {
        data: newComic,
      };
    } catch (err) {
      this.logger.error(err.messsage);

      throw new Error(err.name);
    }
  }
}
