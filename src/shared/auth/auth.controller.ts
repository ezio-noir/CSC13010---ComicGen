import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/request/register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { FileTypeWhiteListFilter } from 'src/common/filters/file-type-whitelist.filter';
import { UsersService } from 'src/features/users/users.service';
import { UserAlreadyExistsError } from 'src/features/users/errors/user-already-exists.error';
import { ResourcesService } from '../resources/resources.service';
import { ResourceAccess } from '../schemas/resource.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private resourcesService: ResourcesService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: FileTypeWhiteListFilter([
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]),
    }),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const newUser = await (async () => {
        const newUser = await this.usersService.createUser({ ...dto });
        if (!file) return newUser;
        const avatar = await this.resourcesService.createResource(
          'avatar',
          newUser._id,
          ResourceAccess.PUBLIC,
          file,
        );
        return await this.usersService.updateUser(newUser._id, {
          avatar: avatar._id,
        });
      })();
      this.logger.log(`User registered: ${newUser._id}.`);
      return {
        message: 'User created successfully.',
        data: newUser,
      };
    } catch (error) {
      this.logger.error('Error registering user.');
      if (error instanceof UserAlreadyExistsError)
        throw new BadRequestException('Username already exists.');
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      const tokens = await this.authService.issueTokens(req.user);
      await this.authService.updateRefreshToken(
        req.user.id,
        tokens.refreshToken,
      );
      res.cookie('accessToken', tokens.accessToken, { httpOnly: false });
      res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
      this.logger.log(`User logged in: ${req.user.id}`);
      return {
        message: 'Login successfully.',
      };
    } catch (err) {
      this.logger.error('Error logging user in.');
      throw new InternalServerErrorException('Error logging user in.');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refreshTokens')
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.issueTokens(req.user);
    await this.authService.updateRefreshToken(req.user.id, tokens.refreshToken);
    res.cookie('accessToken', tokens.accessToken, { httpOnly: false });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return {
      message: 'Tokens refreshed successfully.',
    };
  }
}
