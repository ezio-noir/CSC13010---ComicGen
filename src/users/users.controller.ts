import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer, MulterError, diskStorage } from 'multer';
import { extname } from 'path';
import { FileSystemService } from 'src/file-system/file-system.service';
import { EditUserDetailsDto } from './dto/edit-user-details.dto';
import mongoose from 'mongoose';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private usersService: UsersService,
    private fileSystemService: FileSystemService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  async getUserById(@Param('userId') userId) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist.');
    }
    return {
      data: {
        id: user._id,
        avatar: user.avatar,
        displayName: user.displayName,
      },
    };
  }

  @UseGuards(AccessTokenGuard)
  @Put(':userId')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueName}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
    }),
  )
  async editUserDetails(
    @Req() req,
    @Param('userId') userId,
    @Body() dto: EditUserDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const extractedUserId = new mongoose.Types.ObjectId(req.user.id);
      const userIdAsObjectId = new mongoose.Types.ObjectId(userId);
      if (!extractedUserId.equals(userIdAsObjectId)) {
        throw new BadRequestException(
          "Attempting to modify another user's details.",
        );
      }
      const updatedUser = await this.usersService.updateUser(
        new mongoose.Types.ObjectId(userIdAsObjectId),
        {
          ...dto,
          avatar: file?.path,
        },
      );
      return {
        message: 'User details updated successfully.',
      };
    } catch (error) {
      this.logger.error('Error creating user.', error.stack);
      if (file) this.fileSystemService.removeFile(file.path);

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user.');
    }
  }
}
