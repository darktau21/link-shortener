import { Module } from '@nestjs/common';
import { ShortenerModule } from '../shortener/shortener.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppConfigModule } from '../config/config.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { ValidationExceptionFilter } from './validation-exception.filter';

@Module({
  imports: [ShortenerModule, PrismaModule, AppConfigModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
  ],
})
export class AppModule {}
