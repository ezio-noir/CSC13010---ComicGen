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
import { RegisterDto } from './dto/request/register.dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import { extname } from 'path';
import { FileSystemService } from 'src/file-system/file-system.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RefreshTokenGuard } from './guard/refresh-token-guard';
import { UserAlreadyExistsError } from 'src/users/error/user-already-exists.error';
import { UserPublic } from 'src/users/dto/response/user-public.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private fileSystemService: FileSystemService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const newUser = await this.usersService.createUser({
        ...dto,
        avatar: file?.path,
      });
      this.logger.log(`User registered: ${newUser._id}.`);
      return {
        message: 'User created successfully.',
        data: new UserPublic(newUser),
      };
    } catch (error) {
      this.logger.error('Error registering user.');
      if (file) this.fileSystemService.removeFile(file.path);
      if (error instanceof UserAlreadyExistsError) {
        throw new BadRequestException('Username already exists.');
      }
      throw new InternalServerErrorException('Error creating user.');
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
  @Post('refresh-tokens')
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
