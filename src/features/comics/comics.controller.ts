import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ComicsService } from './comics.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { AccessTokenGuard } from 'src/shared/auth/guards/access-token.guard';
import { RoleGuard } from 'src/shared/auth/guards/roles.guard';
import { CreateComicDto } from './dto/request/create-comic.dto';
import { CreateResourceError } from 'src/common/errors/create-resource.error';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileTypeWhiteListFilter } from 'src/common/filters/file-type-whitelist.filter';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';
import { Types } from 'mongoose';
import { IdentityNotMatchError } from 'src/common/errors/identity-not-match.error';
import { EditComicDetailsDto } from './dto/request/edit-comic-details.dto';
import { ResourcesService } from 'src/shared/resources/resources.service';
import { ResourceAccess } from 'src/shared/schemas/resource.schema';

@Controller('comics')
export class ComicsController {
  private readonly logger = new Logger(ComicsController.name);

  constructor(
    private readonly comicsService: ComicsService,
    private readonly resourcesService: ResourcesService,
  ) {}

  @Post()
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
      fileFilter: FileTypeWhiteListFilter(['image/jpeg', 'image/png']),
    }),
  )
  async createComic(
    @Body() createComicDto: CreateComicDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const newComic = await (async () => {
        const newComic = await this.comicsService.createComic(createComicDto);
        if (!file) return newComic;
        const cover = await this.resourcesService.createResource(
          'comicCover',
          newComic.author,
          ResourceAccess.PUBLIC,
          file,
        );
        return await this.comicsService.updateComic(newComic._id, {
          cover: cover._id,
        });
      })();

      if (!newComic)
        throw new CreateResourceError('Error creating comic resource.');
      return {
        data: newComic,
      };
    } catch (err) {
      this.logger.error(err.messsage);
      throw err;
    }
  }

  @Patch(':comicId')
  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
      fileFilter: FileTypeWhiteListFilter(['image/jpeg', 'image/png']),
    }),
  )
  async editComicDetails(
    @Req() req,
    @Param('comicId', HexStrToMongoOIDTransformPipe) comicId: Types.ObjectId,
    @Body() dto: EditComicDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const userId = Types.ObjectId.createFromHexString(req.user.id);
      const author = await this.comicsService.getComicAuthor(comicId);
      if (!author.equals(userId)) throw new IdentityNotMatchError();

      const cover = await (async () => {
        if (!file) return null;
        return await this.resourcesService.createResource(
          'comicCover',
          userId,
          ResourceAccess.PUBLIC,
          file,
        );
      })();
      const categories = dto?.categories?.map((category) =>
        Types.ObjectId.createFromHexString(category),
      );

      const updateObject = {
        ...dto,
        ...(categories && { categories }),
        ...(cover && { cover: cover._id }),
      };

      const updatedComic = await this.comicsService.updateComic(
        comicId,
        updateObject,
      );

      return {
        message: 'Comic details updated successfully.',
        data: updatedComic,
      };
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof IdentityNotMatchError)
        throw new UnauthorizedException();
      throw new InternalServerErrorException();
    }
  }
}
