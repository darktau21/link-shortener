import { AppConfigService } from '@/config/config.service';
import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export type PrismaService = ReturnType<BasePrismaService['withExtensions']>;

export const PRISMA_SERVICE_INJECTION_TOKEN = 'PrismaService';

@Injectable()
export class BasePrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'warn' | 'info' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PRISMA_SERVICE_INJECTION_TOKEN);

  constructor(private readonly configService: AppConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'info' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ],
    });

    this.$on('query', (e) => {
      this.logger.debug(`Query: ${e.query} ${e.params}`);
    });

    this.$on('info', (e) => {
      this.logger.log(e.message);
    });

    this.$on('warn', (e) => {
      this.logger.warn(e.message);
    });

    this.$on('error', (e) => {
      this.logger.error(e.message);
    });
  }

  withExtensions() {
    return this.$extends({
      result: {
        link: {
          shortUrl: {
            needs: { shortUrlPath: true },
            compute: ({ shortUrlPath }) =>
              `${this.configService.get('BASE_URL')}/${shortUrlPath}`,
          },
        },
      },
    });
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  onModuleInit() {
    this.$connect();
  }
}
