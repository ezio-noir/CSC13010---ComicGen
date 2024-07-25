import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UsersService } from 'src/features/users/users.service';
import { AccessTokenGuard } from 'src/features/auth/guards/access-token.guard';
import { RoleGuard } from 'src/features/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { HexStrToMongoOIDTransformPipe } from 'src/common/pipes/hex-str-to-mongo-oid-transform.pipe';

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
