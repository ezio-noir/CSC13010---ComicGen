import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class FileSystemService {
  private readonly logger = new Logger(FileSystemService.name);

  async removeFile(path: string): Promise<void> {
    try {
      await fs.unlink(path);
      this.logger.log(`File removed: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to remove file: ${path}`, error.stack);
      throw new Error(`Failed to remove file: ${error.message}`);
    }
  }
}
