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
import { MulterError, diskStorage } from 'multer';
import { extname } from 'path';
import { FileSystemService } from 'src/file-system/file-system.service';
import { EditUserDetailsDto } from './dto/request/edit-user-details.dto';
import mongoose, { Types } from 'mongoose';
import { HexStrToMongoOIDTransformPipe } from 'src/shared/pipe/hex-str-to-mongo-oid-transform';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { IdentityNotMatch } from 'src/shared/error/identity-not-match.error';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private usersService: UsersService,
    private fileSystemService: FileSystemService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  async getUserById(@Param('userId', HexStrToMongoOIDTransformPipe) userId) {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User does not exist.');
      }
      return {
        data: user,
      };
    } catch (err) {
      this.logger.error(err.message);
      if (err instanceof UserNotFoundError) throw new NotFoundException();
      throw err;
    }
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
    @Param('userId', HexStrToMongoOIDTransformPipe) userId,
    @Body() dto: EditUserDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const extractedUserId = Types.ObjectId.createFromHexString(req.user.id);
      if (!extractedUserId.equals(userId)) {
        throw new IdentityNotMatch();
      }
      const updatedUser = await this.usersService.updateUser(userId, {
        ...dto,
        avatar: file?.path,
      });
      return {
        message: 'User details updated successfully.',
        data: updatedUser,
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
