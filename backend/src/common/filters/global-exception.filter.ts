import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = status;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const obj = res as any;
        message = obj.message || obj.error || message;
        if (Array.isArray(message)) {
          message = message.join('; ');
        }
      }
      code = status;
    }

    response.status(status).json({
      code,
      data: null,
      message,
    });
  }
}
