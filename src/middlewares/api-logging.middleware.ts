import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const now = Date.now();

    res.on(
      'finish',
      function () {
        const { statusCode } = res;
        const contentLength = res.get('content-length') || 'unknown';
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${Date.now() - now}ms`,
        );
      }.bind(this),
    );

    next();
  }
}
