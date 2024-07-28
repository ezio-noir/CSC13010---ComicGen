import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { RoleGuard } from 'src/shared/auth/guards/roles.guard';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  async generateImages(@Body('prompt') prompt: string) {
    try {
      const data = await this.aiService.generateImages(prompt);
      return {
        message: 'Images generated successfully.',
        data: data,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
