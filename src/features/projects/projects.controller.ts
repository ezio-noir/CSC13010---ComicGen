import {
  Controller,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Types } from 'mongoose';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';

@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async createProject(@Req() req, @UploadedFile() file: Express.Multer.File) {
    try {
      const newProject = await this.projectsService.createProject(
        Types.ObjectId.createFromHexString(req.user.id),
        file,
      );
      this.logger.log(`Project created: ${newProject.id}.`);
      return {
        message: 'Project created successfully.',
        data: newProject,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  @Put(':projectId')
  @UseGuards(AccessTokenGuard)
  async saveProject(
    @Req() req,
    @Param('projectId', HexStrToMongoOIDTransformPipe) projectId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const updatedProject = await this.projectsService.updateProject(
        Types.ObjectId.createFromHexString(req.user.id),
        projectId,
        file,
      );
      return {
        message: 'Project saved successfully',
        data: updatedProject,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
