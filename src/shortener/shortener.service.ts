import { getRandomHashAsync } from '@/lib/get-random-hash';
import {
  PRISMA_SERVICE_INJECTION_TOKEN,
  PrismaService,
} from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ShortenerService {
  constructor(
    @Inject(PRISMA_SERVICE_INJECTION_TOKEN) private readonly db: PrismaService,
  ) {}

  async createLink({
    expiresIn,
    alias,
    ...payload
  }: Omit<Prisma.LinkCreateInput, 'shortUrlPath'> & {
    alias?: string;
    expiresIn?: number;
  }) {
    const shortUrlPath = alias ?? (await getRandomHashAsync());
    const expiresAt =
      payload.expiresAt ??
      (expiresIn ? new Date(Date.now() + expiresIn * 1000) : null);

    return this.db.link.create({
      data: { ...payload, shortUrlPath, expiresAt },
    });
  }

  getLink(shortUrlPath: string) {
    return this.db.link.findUnique({
      where: { shortUrlPath },
      include: {
        _count: {
          select: { visitors: true },
        },
        visitors: { take: 5, orderBy: { visitedAt: 'desc' } },
      },
    });
  }

  addVisitor(shortUrlPath: string, ip: string) {
    return this.db.visitors.create({
      data: { ip, link: { connect: { shortUrlPath } } },
    });
  }

  deleteLink(shortUrlPath: string) {
    return this.db.link.delete({ where: { shortUrlPath } });
  }
}
