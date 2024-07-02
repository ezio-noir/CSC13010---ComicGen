import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@InjectConnection() private readonly connection: Connection) {
        this.logger.log('DatabaseService initialized');

        this.connection.on('connected', () => {
            this.logger.log('Database connected successfully.');
        });

        this.connection.on('error', (error) => {
            this.logger.error('Database connection error: ', error);
        });
        this.connection.on('disconnected', () => {
            this.logger.warn('Database disconnected');
          });
      
          this.connection.on('reconnected', () => {
            this.logger.log('Database reconnected');
          });
      
    }
}
