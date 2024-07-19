import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UsersService } from 'src/users/users.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/roles.enum';
import { HexStrToMongoOIDTransformPipe } from 'src/shared/pipe/hex-str-to-mongo-oid-transform';

@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory =
        await this.categoriesService.createCategory(createCategoryDto);
      this.logger.log(`Category created: ${newCategory.id}`);
      return {
        data: newCategory,
      };
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  @Roles(Role.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get(':categoryId')
  async getCategoy(
    @Param('categoryId', HexStrToMongoOIDTransformPipe) categoryId,
  ) {
    try {
      const category = await this.categoriesService.getCategory(categoryId);
      return {
        data: category,
      };
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }
}
