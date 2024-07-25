import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageWriteError } from './error/storage-write.error';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
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
}
