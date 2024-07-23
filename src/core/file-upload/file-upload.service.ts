import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('storage.region');
    this.client = new S3Client({
      region: region,
      endpoint: `https://s3.${region}.backblazeb2.com`,
      credentials: {
        accessKeyId: this.configService.get('storage.id'),
        secretAccessKey: this.configService.get('storage.app-key'),
      },
    });
  }

  async uploadFileToBucket(
    path: string,
    { file, fileName }: { file: Express.Multer.File; fileName: string },
  ) {
    const bucketName = this.configService.get('storage.bucket-name');
    const key = `${path}/${Date.now().toString()}-${fileName}`;
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
        ContentLength: file.size,
      }),
    );
    console.log(result);
    return 'success!';
  }
}
