import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class HexStrToMongoOIDTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return Types.ObjectId.createFromHexString(value);
    } catch (err) {
      throw new BadRequestException('Invalid ID');
    }
  }
}
