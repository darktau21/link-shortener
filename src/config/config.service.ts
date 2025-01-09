import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { ConfigSchema } from './config.schema';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<ConfigSchema>) {}

  get(key: keyof ConfigSchema) {
    return this.configService.get<ConfigSchema>(key, { infer: true });
  }
}
