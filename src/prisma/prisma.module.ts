import { Global, Module } from '@nestjs/common';

import { AppConfigService } from '@/config/config.service';
import {
  BasePrismaService,
  PRISMA_SERVICE_INJECTION_TOKEN,
} from './prisma.service';

@Global()
@Module({
  exports: [PRISMA_SERVICE_INJECTION_TOKEN],
  providers: [
    {
      provide: PRISMA_SERVICE_INJECTION_TOKEN,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) =>
        new BasePrismaService(configService).withExtensions(),
    },
  ],
})
export class PrismaModule {}
