import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageWriteError } from './error/storage-write.error';
import { extname } from 'path';
import mongoose, { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RawResource } from '../schemas/raw-resource.schema';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel('RawResource')
    private rawResourceModel: mongoose.Model<RawResource>,
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

  async addRawResource(
    owner: Types.ObjectId,
    path: string,
    file: Express.Multer.File,
  ) {
    const session = await this.rawResourceModel.db.startSession();
    try {
      const newRawResource = await session.withTransaction(async () => {
        const newRawResource = new this.rawResourceModel({
          owner: owner,
        });
        const url = await this.uploadFileToBucket(path, file);
        newRawResource.url = url;
        await newRawResource.save({ session });
        return newRawResource;
      });
      this.logger.log(`Raw resource saved: ${newRawResource._id}`);
      return newRawResource;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async uploadFileToBucket(path: string, file: Express.Multer.File) {
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
