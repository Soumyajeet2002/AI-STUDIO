import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { RequestWithId } from '../types/request-with-id.type';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const startedAt = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;

      this.logger.log({
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs,
      });
    });

    next();
  }
}
