import { Injectable, Logger } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Resource, ResourceAccess } from '../schemas/resource.schema';
import { ResourceNotFoundError } from 'src/common/errors/resource-not-found.error';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectModel('Resource') private resourceModel: mongoose.Model<Resource>,
    private readonly storageService: StorageService,
  ) {}

  async createResource(
    path: string,
    userId: Types.ObjectId,
    access: ResourceAccess,
    file: Express.Multer.File,
  ) {
    const session = await this.resourceModel.db.startSession();
    try {
      const newResource = await session.withTransaction(async () => {
        const url = await this.storageService.uploadFileToBucket(path, file);
        if (!url) throw new Error('Failed to upload file.');
        const newResource = new this.resourceModel({
          owner: userId,
          url: url,
          access: access,
        });
        await newResource.save({ session });
        return newResource;
      });
      this.logger.log(`Resource created: ${newResource.id}.`);
      return newResource;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async overwriteResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    const session = await this.resourceModel.db.startSession();
    try {
      const updatedResource = await session.withTransaction(async () => {
        const resource = await this.resourceModel
          .findOne({ _id: resourceId })
          .session(session);
        if (!resource || !resource.owner.prototype.equals(userId))
          throw new Error('Invalid resource.');

        const url = await this.storageService.uploadFileToBucket(
          resource.url,
          file,
        );
        if (!url) throw new Error('Failed to upload file.');

        resource.url = url;
        await resource.save({ session });
        return resource;
      });

      this.logger.log(`Resource updated: ${updatedResource.id}`);
      return updatedResource;
    } catch (error) {
      this.logger.error(error.message);
    } finally {
      await session.endSession();
    }
  }

  async getResource(userId: Types.ObjectId, resourceId: Types.ObjectId) {
    try {
      const resource = await this.resourceModel.findOne({ _id: resourceId });
      if (!resource) throw new ResourceNotFoundError();

      if (
        resource.access == ResourceAccess.OWNER &&
        !userId.equals(resource.owner.prototype)
      )
        throw new Error('Insufficient access');

      return this.storageService.getFileFromBucket(resource.url);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
