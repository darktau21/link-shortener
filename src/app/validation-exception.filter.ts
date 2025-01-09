import {
  Catch,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

@Catch(ZodValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const validationError = exception.getZodError();
    const fieldErrors = validationError.flatten().fieldErrors;

    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Payload validation error',
      statusCode: HttpStatus.BAD_REQUEST,
      error: fieldErrors,
    });
  }
}
