import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Logger, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import { extname } from 'path';
import { FileSystemService } from 'src/file-system/file-system.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guard/refresh-token-guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private userService: UserService,
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
        }
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
    })
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
      try {
        if (await this.userService.getUserByUsername(dto.username)) {
          throw new BadRequestException('Username already exists.');
        }
        const newUser = await this.userService.createUser({
          ...dto,
          avatar: file?.path,
        });
        this.logger.log(`New user created: ${newUser._id}`);
        return {
          message: 'User created successfully.',
          data: {
            id: newUser._id,
            username: newUser.username,
            displayName: newUser.displayName,
            avatar: newUser.avatar,
          }
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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.issueTokens(req.user);
    await this.authService.updateRefreshToken(req.user.id, tokens.refreshToken);
    res.cookie('accessToken', tokens.accessToken, { httpOnly: false });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return {
      message: 'Login successfully.'
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.issueTokens(req.user);
    await this.authService.updateRefreshToken(req.user.id, tokens.refreshToken);
    res.cookie('accessToken', tokens.accessToken, { httpOnly: false });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return {
      message: 'Tokens refreshed successfully.'
    };
  }
}
