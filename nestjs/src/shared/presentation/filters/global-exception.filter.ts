import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      code = res.error || 'HTTP_EXCEPTION';
      message = res.message || exception.message;
      if (Array.isArray(res.message)) {
        details = res.message;
        message = 'Validation error';
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof DomainException) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Manejar errores conocidos de Prisma
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'A record with that unique field already exists';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        message = 'Record to update or delete not found';
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Unhandled Exception:', exception);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
