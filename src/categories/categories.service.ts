import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SaveOptions, Types } from 'mongoose';
import { Category } from 'src/schemas/category.schema';
import { CreateCategoryDto } from './dto/request/create-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: mongoose.Model<Category>,
  ) {}

  async getCategory(categoryId: Types.ObjectId) {
    const category = await this.categoryModel.findById(categoryId);
    return category ? category.toJSON() : null;
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = new this.categoryModel({
        name: createCategoryDto.name,
      });
      await newCategory.save();
      this.logger.log(`Category created: ${newCategory.name}`);
      return { id: newCategory._id };
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  async increaseComicCount(categoryId: Types.ObjectId, options?: SaveOptions) {
    const session = options?.session;
    try {
      return await this.categoryModel.findByIdAndUpdate(
        categoryId,
        { $inc: { comicCount: 1 } },
        { session },
      );
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }
}
