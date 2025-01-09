import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateLinkSchema = z.object({
  originalUrl: z.string().url(),
  alias: z.string().min(6).max(20).optional(),
  expiresAt: z
    .string()
    .refine(
      (val) => {
        return !isNaN(Date.parse(val));
      },
      {
        message: 'Invalid date-time format',
      },
    )
    .refine(
      (val) => {
        return new Date(val) > new Date();
      },
      {
        message: 'Date-time must be in the future',
      },
    )
    .transform((val) => new Date(val))
    .optional(),
  expiresIn: z.number().int().min(10).optional(),
});

export class CreateLinkDto extends createZodDto(CreateLinkSchema) {}
