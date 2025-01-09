import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LinkAnalyticsSchema = z.object({
  clicksCount: z.number().int().default(0),
  visitors: z.array(
    z.object({
      ip: z.string().ip(),
      visitedAt: z.date().transform((date) => date.toISOString()),
    }),
  ),
});

export class LinkAnalyticsDto extends createZodDto(LinkAnalyticsSchema) {}
