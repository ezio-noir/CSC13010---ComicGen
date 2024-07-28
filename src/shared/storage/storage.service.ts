import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageWriteError } from './error/storage-write.error';
import { extname } from 'path';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Resource } from '../schemas/resource.schema';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel('Resource')
    private resourceModel: mongoose.Model<Resource>,
  ) {
    const storageConfig = this.configService.get('storage');
    this.client = new S3Client({
      region: storageConfig['region'],
      endpoint: storageConfig['endpoint'],
      credentials: {
        accessKeyId: storageConfig['bucket_id'],
        secretAccessKey: storageConfig['app_key'],
      },
    });
    this.bucketName = storageConfig['bucket_name'];
  }

  // async createResource(
  //   owner: Types.ObjectId,
  //   access: ResourceAccess,
  //   path: string,
  //   file: Express.Multer.File,
  // ) {
  //   const session = await this.resourceModel.db.startSession();
  //   try {
  //     const newResource = await session.withTransaction(async () => {
  //       const newResource = new this.resourceModel({
  //         owner: owner,
  //         access: access,
  //       });
  //       const url = await this.uploadFileToBucket(path, file);
  //       newResource.url = url;
  //       await newResource.save({ session });
  //       return newResource;
  //     });
  //     this.logger.log(`Raw resource saved: ${newResource._id}`);
  //     return newResource;
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw error;
  //   } finally {
  //     await session.endSession();
  //   }
  // }

  async uploadFileToBucket(path: string, file: Express.Multer.File) {
    try {
      const extName = extname(file.originalname) || '';
      const key = `${path}/${Date.now().toString()}${extName}`;
      const result = await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private',
          ContentLength: file.size,
        }),
      );
      this.logger.log(`Storage write succeed.`);
      if (result.$metadata.httpStatusCode !== 200)
        throw new StorageWriteError();
      return key;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getFileFromBucket(key: string) {
    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      if (result.$metadata.httpStatusCode != 200)
        throw new Error('Error retrieving file.');

      const passThroughStream = new PassThrough();
      (result.Body as Readable).pipe(passThroughStream);

      return {
        stream: passThroughStream,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
