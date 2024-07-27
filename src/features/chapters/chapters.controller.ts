import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { RegisterChapterDto } from './dtos/request/register-chapter.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { RoleGuard } from 'src/shared/auth/guards/roles.guard';

@Controller('chapters')
export class ChaptersController {
  private readonly logger = new Logger(ChaptersController.name);

  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async registerChapter(
    @Body(new ValidationPipe({ transform: true })) dto: RegisterChapterDto,
  ) {
    try {
      const newChapter = await this.chaptersService.createChapter(dto);
      return {
        message: 'Chapter registered successfully.',
        data: newChapter,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
