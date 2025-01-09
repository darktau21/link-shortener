import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SHORT_URL_PARAM = 'shortUrlPath';

const ShortUrlParamSchema = z.object({
  [SHORT_URL_PARAM]: z.string().min(6).max(20),
});

export class ShortUrlParamDto extends createZodDto(ShortUrlParamSchema) {}
