import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileSystemService } from 'src/shared/file-system/file-system.service';
import { EditUserDetailsDto } from './dtos/request/edit-user-details.dto';
import { Types } from 'mongoose';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';
import { UserNotFoundError } from 'src/common/errors/user-not-found.error';
import { IdentityNotMatchError } from 'src/common/errors/identity-not-match.error';
import { UserPublicDetailsDto } from './dtos/response/user-public-details.dto';
import { RoleGuard } from 'src/shared/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { FileTypeWhiteListFilter } from 'src/common/filters/file-type-whitelist.filter';
import { StorageService } from 'src/shared/storage/storage.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private storageService: StorageService,
    private usersService: UsersService,
    private fileSystemService: FileSystemService,
  ) {}

  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get(':userId')
  async getUser(@Param('userId', HexStrToMongoOIDTransformPipe) userId) {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User does not exist.');
      }
      return {
        data: new UserPublicDetailsDto({
          id: user._id.toString(),
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          createdAt: user.createdAt,
          roles: user.roles,
        }),
      };
    } catch (err) {
      this.logger.error(err.message);
      if (err instanceof UserNotFoundError) throw new NotFoundException();
      throw err;
    }
  }

  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Put(':userId')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: FileTypeWhiteListFilter(['image/jpeg', 'image/png']),
    }),
  )
  async editUserDetails(
    @Req() req,
    @Param('userId', HexStrToMongoOIDTransformPipe) userId: Types.ObjectId,
    @Body() dto: EditUserDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const extractedUserId = Types.ObjectId.createFromHexString(req.user.id);
      if (!extractedUserId.equals(userId)) {
        throw new IdentityNotMatchError();
      }

      if (!(await this.usersService.doesUserExist(userId)))
        throw new UserNotFoundError();

      const avatar = await (async () => {
        if (!file) return null;
        return await this.storageService.addRawResource(userId, 'avatar', file);
      })();

      const updateObject =
        avatar != null
          ? {
              ...dto,
              avatar: avatar.url,
            }
          : {
              ...dto,
            };

      const updatedUser = await this.usersService.updateUser(
        userId,
        updateObject,
      );
      return {
        message: 'User details updated successfully.',
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error('Error creating user.', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user.');
    }
  }

  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':userId')
  async deleteUser(
    @Req() req,
    @Param('userId', HexStrToMongoOIDTransformPipe) userId: Types.ObjectId,
  ) {
    try {
      const extractedUserId = Types.ObjectId.createFromHexString(req.user.id);
      if (!extractedUserId.equals(userId)) throw new IdentityNotMatchError();
      const user = await this.usersService.deleteUser(userId);
      this.logger.log(`User deteled: ${user.id}.`);
      return {
        message: 'User deleted successfully.',
      };
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof IdentityNotMatchError)
        throw new UnauthorizedException();
      throw new Error('Error deleting user.');
    }
  }
}
