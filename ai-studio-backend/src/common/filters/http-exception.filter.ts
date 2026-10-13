/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string | string[];
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const requestId =
      request.headers['x-request-id']?.toString() ??
      (request as Request & { id?: string }).id;

    const errorResponse = this.buildErrorResponse(
      exception,
      exceptionResponse,
      statusCode,
      request,
      requestId,
    );

    this.logException(exception, request, requestId, statusCode);

    response.status(statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    exceptionResponse: string | object | null,
    statusCode: number,
    request: Request,
    requestId?: string,
  ): ErrorResponse {
    let code = this.getDefaultErrorCode(statusCode);

    let message: string | string[] = this.getDefaultErrorMessage(statusCode);

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const response = exceptionResponse as Record<string, unknown>;

      if (typeof response.code === 'string') {
        code = response.code;
      }

      if (
        typeof response.message === 'string' ||
        Array.isArray(response.message)
      ) {
        message = response.message as string | string[];
      }

      /**
       * class-validator errors may come through as:
       *
       * {
       *   message: [
       *     'email must be an email',
       *     'password must be longer than or equal to 8 characters'
       *   ],
       *   error: 'Bad Request',
       *   statusCode: 400
       * }
       */
      if (Array.isArray(response.message)) {
        message = response.message;
      }
    }

    /**
     * Never expose internal exception details to clients.
     */
    if (!(exception instanceof HttpException)) {
      code = 'INTERNAL_SERVER_ERROR';
      message = 'Internal server error';
    }

    return {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      ...(requestId ? { requestId } : {}),
    };
  }

  private logException(
    exception: unknown,
    request: Request,
    requestId: string | undefined,
    statusCode: number,
  ): void {
    const method = request.method;
    const url = request.originalUrl;

    /**
     * 4xx errors are expected client errors.
     */
    if (statusCode >= 400 && statusCode < 500) {
      this.logger.warn(
        {
          requestId,
          method,
          url,
          statusCode,
          exception,
        },
        `HTTP ${statusCode} ${method} ${url}`,
      );

      return;
    }

    /**
     * 5xx errors are server errors.
     *
     * Log the complete exception including stack trace.
     */
    this.logger.error(
      {
        requestId,
        method,
        url,
        statusCode,
        exception,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `HTTP ${statusCode} ${method} ${url}`,
    );
  }

  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';

      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';

      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';

      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';

      case HttpStatus.CONFLICT:
        return 'CONFLICT';

      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';

      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private getDefaultErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';

      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';

      case HttpStatus.FORBIDDEN:
        return 'Forbidden';

      case HttpStatus.NOT_FOUND:
        return 'Resource not found';

      case HttpStatus.CONFLICT:
        return 'Resource conflict';

      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Request could not be processed';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests';

      default:
        return 'Internal server error';
    }
  }
}
