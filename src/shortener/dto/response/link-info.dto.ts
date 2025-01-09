import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LinkInfoSchema = z.object({
  originalUrl: z.string().url(),
  shortUrl: z.string().url(),
  shortUrlPath: z.string(),
  createdAt: z.date().transform((date) => date.toISOString()),
  clicksCount: z.number().int().default(0),
});

export class LinkInfoDto extends createZodDto(LinkInfoSchema) {}
